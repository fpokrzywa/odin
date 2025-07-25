interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

interface ChatThread {
  id: string;
  assistantId: string;
  assistantName: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  isPinned?: boolean;
  customTitle?: string;
}

class ChatService {
  private apiKey: string | null = null;
  private baseURL = 'https://api.openai.com/v1';
  private threads: Map<string, ChatThread> = new Map();
  private currentThreadId: string | null = null;
  private abortController: AbortController | null = null;
  private shouldStopStreaming: boolean = false;
  private streamingCallbacks: Map<string, (chunk: string) => void> = new Map();
  private activeStreamingThreads: Set<string> = new Set();

  constructor() {
    // Get API key from environment or localStorage
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || localStorage.getItem('openai_api_key') || null;
    this.loadThreadsFromStorage();
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    localStorage.setItem('openai_api_key', apiKey);
  }

  getApiKey(): string | null {
    return import.meta.env.VITE_OPENAI_API_KEY || this.apiKey;
  }

  private loadThreadsFromStorage() {
    try {
      const stored = localStorage.getItem('chat_threads');
      if (stored) {
        const threadsData = JSON.parse(stored);
        this.threads = new Map(
          threadsData.map((thread: any) => [
            thread.id,
            {
              ...thread,
              createdAt: new Date(thread.createdAt),
              updatedAt: new Date(thread.updatedAt),
              messages: thread.messages.map((msg: any) => ({
                ...msg,
                timestamp: new Date(msg.timestamp)
              }))
            }
          ])
        );
      }
    } catch (error) {
      console.warn('Error loading chat threads from storage:', error);
    }
  }

  private saveThreadsToStorage() {
    try {
      const threadsArray = Array.from(this.threads.values());
      localStorage.setItem('chat_threads', JSON.stringify(threadsArray));
    } catch (error) {
      console.warn('Error saving chat threads to storage:', error);
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const currentApiKey = this.getApiKey();
    if (!currentApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${currentApiKey}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
        throw new Error(error.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Cannot connect to OpenAI API directly from browser. This is a CORS limitation.');
      }
      throw error;
    }
  }

  createThread(assistantName: string, displayName: string): string {
  }
  createThread(assistantId: string, displayName: string): string {
    const threadId = `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const thread: ChatThread = {
      id: threadId,
      assistantId: assistantId,
      assistantName: displayName,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.threads.set(threadId, thread);
    this.currentThreadId = threadId;
    this.saveThreadsToStorage();
    return threadId;
  }

  getCurrentThread(): ChatThread | null {
    if (!this.currentThreadId) return null;
    return this.threads.get(this.currentThreadId) || null;
  }

  getThread(threadId: string): ChatThread | null {
    return this.threads.get(threadId) || null;
  }

  getAllThreads(): ChatThread[] {
    return Array.from(this.threads.values()).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  setCurrentThread(threadId: string) {
    if (this.threads.has(threadId)) {
      this.currentThreadId = threadId;
    }
  }

  updateThread(thread: ChatThread) {
    this.threads.set(thread.id, thread);
    this.saveThreadsToStorage();
  }

  pinThread(threadId: string, isPinned: boolean) {
    const thread = this.threads.get(threadId);
    if (thread) {
      thread.isPinned = isPinned;
      thread.updatedAt = new Date();
      this.threads.set(threadId, thread);
      this.saveThreadsToStorage();
    }
  }

  renameThread(threadId: string, customTitle: string) {
    const thread = this.threads.get(threadId);
    if (thread) {
      thread.customTitle = customTitle.trim() || undefined;
      this.saveThreadsToStorage();
    }
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async sendMessage(message: string, threadId?: string): Promise<ChatMessage> {
    const targetThreadId = threadId || this.currentThreadId;
    if (!targetThreadId) {
      throw new Error('No active chat thread');
    }

    const thread = this.threads.get(targetThreadId);
    if (!thread) {
      throw new Error('Thread not found');
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: this.generateMessageId(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    thread.messages.push(userMessage);
    thread.updatedAt = new Date();

    // Add loading assistant message
    const loadingMessage: ChatMessage = {
      id: this.generateMessageId(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true
    };

    thread.messages.push(loadingMessage);
    this.saveThreadsToStorage();

    try {
      // Try to use real OpenAI API if available, otherwise simulate
      const assistantResponse = await this.getAssistantResponse(message, thread.assistantId, thread.assistantName);
      
      // Update the loading message with the actual response
      const responseMessage: ChatMessage = {
        ...loadingMessage,
        content: assistantResponse,
        isLoading: false
      };

      // Replace loading message with actual response
      const loadingIndex = thread.messages.findIndex(msg => msg.id === loadingMessage.id);
      if (loadingIndex !== -1) {
        thread.messages[loadingIndex] = responseMessage;
      }

      thread.updatedAt = new Date();
      this.saveThreadsToStorage();

      return responseMessage;
    } catch (error) {
      // Remove loading message on error
      thread.messages = thread.messages.filter(msg => msg.id !== loadingMessage.id);
      this.saveThreadsToStorage();
      throw error;
    }
  }

  async sendMessageWithStreaming(
    message: string, 
    onChunk: (chunk: string) => void,
    threadId?: string
  ): Promise<ChatMessage> {
    const targetThreadId = threadId || this.currentThreadId;
    if (!targetThreadId) {
      throw new Error('No active chat thread');
    }

    const thread = this.threads.get(targetThreadId);
    if (!thread) {
      throw new Error('Thread not found');
    }

    // Register streaming callback for this thread
    this.streamingCallbacks.set(targetThreadId, onChunk);
    this.activeStreamingThreads.add(targetThreadId);

    // Add user message
    const userMessage: ChatMessage = {
      id: this.generateMessageId(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    thread.messages.push(userMessage);
    thread.updatedAt = new Date();
    this.saveThreadsToStorage();

    try {
      // Get response from OpenAI or simulation
      const fullResponse = await this.getAssistantResponse(message, thread.assistantId, thread.assistantName);
      
      // Stream the response word by word
      await this.streamResponse(fullResponse, targetThreadId);
      
      // Add the complete message to the thread
      const responseMessage: ChatMessage = {
        id: this.generateMessageId(),
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date()
      };

      thread.messages.push(responseMessage);
      thread.updatedAt = new Date();
      this.saveThreadsToStorage();

      return responseMessage;
    } catch (error) {
      // Clean up streaming state on error
      this.streamingCallbacks.delete(targetThreadId);
      this.activeStreamingThreads.delete(targetThreadId);
      this.saveThreadsToStorage();
      throw error;
    } finally {
      // Clean up streaming state when done
      this.streamingCallbacks.delete(targetThreadId);
      this.activeStreamingThreads.delete(targetThreadId);
    }
  }

  private async streamResponse(text: string, threadId: string): Promise<void> {
    this.shouldStopStreaming = false;
    this.abortController = new AbortController();
    
    const words = text.split(' ');
    
    for (let i = 0; i < words.length; i++) {
      // Check if streaming should be stopped
      if (this.shouldStopStreaming || this.abortController?.signal.aborted || !this.activeStreamingThreads.has(threadId)) {
        break;
      }
      
      const word = words[i];
      const currentText = words.slice(0, i + 1).join(' ');
      
      // Call the chunk callback if it exists (component might be unmounted)
      const callback = this.streamingCallbacks.get(threadId);
      if (callback) {
        callback(currentText);
      }
      
      // Add a small delay to simulate streaming
      await new Promise(resolve => setTimeout(resolve, 15 + Math.random() * 25));
    }
    
    this.abortController = null;
  }
  
  private async getAssistantResponse(userMessage: string, assistantId: string, assistantName: string): Promise<string> {
    const currentApiKey = this.getApiKey();
    
    // If we have an API key and a real OpenAI assistant ID, try to use the real API
    if (currentApiKey && assistantId.startsWith('asst_')) {
      try {
        return await this.sendMessageToOpenAIAssistant(userMessage, assistantId);
      } catch (error) {
        console.warn('Failed to use OpenAI API, falling back to simulation:', error);
        // Fall back to simulation if API fails
        return this.simulateAssistantResponse(userMessage, assistantName);
      }
    }
    
    // Use simulation for non-OpenAI assistants or when no API key
    return this.simulateAssistantResponse(userMessage, assistantName);
  }

  private async sendMessageToOpenAIAssistant(message: string, assistantId: string): Promise<string> {
    try {
      // Create a thread
      const threadResponse = await this.makeRequest('/threads', {
        method: 'POST',
        body: JSON.stringify({})
      });
      
      const threadId = threadResponse.id;
      
      // Add message to thread
      await this.makeRequest(`/threads/${threadId}/messages`, {
        method: 'POST',
        body: JSON.stringify({
          role: 'user',
          content: message
        })
      });
      
      // Run the assistant
      const runResponse = await this.makeRequest(`/threads/${threadId}/runs`, {
        method: 'POST',
        body: JSON.stringify({
          assistant_id: assistantId
        })
      });
      
      const runId = runResponse.id;
      
      // Poll for completion
      let run = runResponse;
      while (run.status === 'queued' || run.status === 'in_progress') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        run = await this.makeRequest(`/threads/${threadId}/runs/${runId}`);
      }
      
      if (run.status === 'completed') {
        // Get the assistant's response
        const messagesResponse = await this.makeRequest(`/threads/${threadId}/messages`);
        const assistantMessage = messagesResponse.data.find((msg: any) => msg.role === 'assistant');
        
        if (assistantMessage && assistantMessage.content[0]?.text?.value) {
          return assistantMessage.content[0].text.value;
        }
      }
      
      throw new Error(`Assistant run failed with status: ${run.status}`);
      
    } catch (error) {
      throw new Error(`OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  stopStreaming() {
    this.shouldStopStreaming = true;
    if (this.abortController) {
      this.abortController.abort();
    }
    // Clear all streaming callbacks and active threads
    this.streamingCallbacks.clear();
    this.activeStreamingThreads.clear();
  }

  private async simulateAssistantResponse(userMessage: string, assistantName: string): Promise<string> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Generate contextual responses based on assistant type and user input
    return this.generateContextualResponse(assistantName, userMessage);
  }

  private generateContextualResponse(assistantName: string, userMessage: string): string {
    const message = userMessage.toLowerCase();

    if (assistantName === 'IT Support') {
      if (message.includes('password') || message.includes('login')) {
        return [
          "I can help you with password issues. For security reasons, I'll need to verify your identity first. Here's what you can do:\n\n1. **Self-Service Reset**: Use our password reset portal at portal.company.com/reset\n2. **Verify Identity**: You'll need your employee ID and registered email\n3. **Security Questions**: Answer the security questions you set up during onboarding\n4. **Contact IT**: If self-service doesn't work, call IT at ext. 4357\n\nFor future reference, passwords must be at least 12 characters with uppercase, lowercase, numbers, and special characters. They expire every 90 days.",
          "Password problems are very common, so don't worry! Let me walk you through the troubleshooting steps:\n\n**Quick Fixes:**\n1. Check if Caps Lock is enabled\n2. Try typing your password in a text editor first to verify it's correct\n3. Clear your browser cache and cookies\n4. Try using an incognito/private browsing window\n\n**Advanced Steps:**\n5. Restart your computer to clear any cached credentials\n6. Check if your account is locked (you'll get a specific error message)\n7. Verify you're using the correct username format (usually firstname.lastname)\n\n**Still Having Issues?**\nContact IT support at help@company.com or call ext. 4357. We're available 24/7 for password emergencies."
        ][Math.floor(Math.random() * 2)];
      }
      if (message.includes('printer') || message.includes('print')) {
        return [
          "Let me help you troubleshoot your printer issues. Here's a comprehensive step-by-step guide:\n\n**Basic Checks:**\n1. Verify the printer is powered on and all cables are securely connected\n2. Check if there are any error lights or messages on the printer display\n3. Ensure there's paper in the tray and toner/ink cartridges aren't empty\n\n**Software Troubleshooting:**\n4. Restart the Print Spooler service:\n   - Press Win+R, type 'services.msc'\n   - Find 'Print Spooler', right-click and restart\n5. Clear the print queue of any stuck jobs\n6. Update or reinstall printer drivers from the manufacturer's website\n\n**Network Printer Issues:**\n7. Check if other users can print to the same printer\n8. Verify the printer's IP address hasn't changed\n9. Try printing a test page directly from the printer\n\nIf these steps don't resolve the issue, please let me know the specific error message and printer model.",
          "Printer problems can be frustrating! Let me guide you through a systematic approach:\n\n**Physical Inspection:**\n- Check all cable connections (USB, Ethernet, power)\n- Verify paper is loaded correctly and not jammed\n- Ensure toner/ink cartridges are properly installed and not empty\n- Look for any error messages on the printer's display panel\n\n**Windows Troubleshooting:**\n1. Go to Settings > Devices > Printers & scanners\n2. Remove the problematic printer\n3. Restart your computer\n4. Re-add the printer (it should auto-detect)\n5. Set it as the default printer if needed\n\n**Advanced Solutions:**\n- Download latest drivers from manufacturer's website\n- Run Windows built-in printer troubleshooter\n- Check if Windows Update has any pending driver updates\n- For network printers, verify the IP address and network connectivity\n\nWhat specific issue are you experiencing? Is it not printing at all, printing blank pages, or showing error messages?"
        ][Math.floor(Math.random() * 2)];
      }
      return [
        "Hello! I'm here to help with all your IT support needs. I can assist with a wide range of technical issues including:\n\n**Common Issues I Handle:**\n- Password resets and account lockouts\n- Printer and hardware troubleshooting\n- Software installation and updates\n- Network connectivity problems\n- Email configuration and sync issues\n- VPN setup and connection problems\n- Computer performance optimization\n- Security software and antivirus issues\n\n**To Better Assist You:**\nPlease provide details about:\n1. What specific problem you're experiencing\n2. Any error messages you've seen (exact wording helps)\n3. When the issue started occurring\n4. What device/software you're using\n5. Any troubleshooting steps you've already tried\n\nThe more information you can provide, the faster I can help resolve your issue!",
        "Welcome to IT Support! I'm here to help resolve any technical challenges you're facing.\n\n**How I Can Help:**\n- Troubleshoot hardware and software issues\n- Guide you through step-by-step solutions\n- Provide preventive maintenance tips\n- Help with account and security issues\n- Assist with software installations and updates\n- Resolve network and connectivity problems\n\n**For Fastest Resolution:**\nWhen describing your issue, please include:\n- Detailed description of the problem\n- Exact error messages (screenshots are helpful)\n- Your operating system and software versions\n- When the issue first occurred\n- Any recent changes to your system\n\n**Emergency Support:**\nFor urgent issues affecting business operations, call our emergency line at ext. 911 or email urgent@company.com\n\nWhat technical issue can I help you with today?"
      ][Math.floor(Math.random() * 2)];
    }

    if (assistantName === 'HR Support') {
      if (message.includes('pto') || message.includes('vacation') || message.includes('time off')) {
        return [
          "I'd be happy to help you with PTO (Paid Time Off) information and procedures.\n\n**PTO Request Process:**\n1. **Advance Notice**: Submit requests at least 2 weeks in advance (4 weeks for extended leave)\n2. **HR Portal**: Log into the employee portal at hr.company.com\n3. **Manager Approval**: Your direct manager must approve all PTO requests\n4. **Blackout Periods**: Some departments have blackout periods during busy seasons\n\n**PTO Accrual Rates:**\n- 0-2 years: 15 days annually (1.25 days/month)\n- 3-5 years: 20 days annually (1.67 days/month)\n- 6+ years: 25 days annually (2.08 days/month)\n\n**Important Notes:**\n- PTO rolls over up to 40 hours annually\n- Unused PTO over the limit is forfeited on December 31st\n- You can check your current balance in the employee dashboard\n- Sick leave is separate from PTO (10 days annually)\n\n**Need Help?**\nContact HR at hr@company.com or call ext. 2468 if you have trouble accessing the portal.",
          "Let me provide you with comprehensive information about our time off policies:\n\n**Types of Leave Available:**\n- **PTO (Paid Time Off)**: Vacation, personal days\n- **Sick Leave**: Medical appointments, illness\n- **Personal Leave**: Unpaid time off for personal matters\n- **FMLA**: Family and Medical Leave Act (eligible after 1 year)\n- **Bereavement**: Up to 5 days for immediate family\n\n**PTO Accrual Schedule:**\nYour PTO accrual depends on your length of service:\n- New employees: 15 days/year (prorated first year)\n- 3+ years: 20 days/year\n- 6+ years: 25 days/year\n- 10+ years: 30 days/year\n\n**Request Guidelines:**\n- Submit requests through the HR portal\n- Minimum 2 weeks notice for regular PTO\n- 30 days notice for extended leave (5+ consecutive days)\n- Manager approval required\n- Consider team coverage and project deadlines\n\n**Checking Your Balance:**\nView your current PTO balance in the employee self-service portal or on your pay stub.\n\nDo you have specific questions about requesting time off or your current balance?"
        ][Math.floor(Math.random() * 2)];
      }
      if (message.includes('benefits') || message.includes('insurance')) {
        return [
          "I'm happy to provide information about our comprehensive benefits package:\n\n**Health Insurance Options:**\n- **PPO Plan**: Higher premiums, more flexibility in choosing providers\n- **HMO Plan**: Lower premiums, requires primary care physician referrals\n- **High Deductible Health Plan (HDHP)**: Lower premiums, paired with HSA\n- **Health Savings Account (HSA)**: Tax-advantaged savings for medical expenses\n\n**Additional Insurance:**\n- **Dental**: Two plan options (Basic and Premium)\n- **Vision**: Coverage for exams, glasses, and contacts\n- **Life Insurance**: Basic coverage provided, additional coverage available\n- **Disability**: Short-term and long-term disability insurance\n\n**Retirement Benefits:**\n- **401(k) Plan**: Company matches 50% of contributions up to 6% of salary\n- **Vesting**: Immediate vesting for employee contributions, 3-year vesting for company match\n- **Investment Options**: 15+ fund choices including target-date funds\n\n**Other Benefits:**\n- Flexible Spending Accounts (FSA) for healthcare and dependent care\n- Employee Assistance Program (EAP)\n- Tuition reimbursement up to $5,000 annually\n- Wellness programs and gym membership discounts\n\n**Open Enrollment:**\nAnnual enrollment period is November 1-15. You can make changes outside this period only for qualifying life events.\n\nWould you like detailed information about any specific benefit?",
          "Let me break down our comprehensive benefits package for you:\n\n**Medical Coverage:**\nWe offer three medical plan options to fit different needs and budgets:\n1. **Traditional PPO**: Most flexibility, higher cost\n2. **HMO**: Lower cost, requires referrals\n3. **High Deductible + HSA**: Lowest premiums, tax savings\n\n**Company Contributions:**\n- Medical: Company pays 80% of premiums\n- Dental: Company pays 100% of basic plan\n- Vision: Company pays 75% of premiums\n- Life Insurance: Basic coverage (1x salary) provided free\n\n**Retirement Planning:**\n- 401(k) with company match up to 3% of salary\n- Immediate vesting on your contributions\n- Company match vests over 3 years\n- Financial planning resources available\n\n**Work-Life Balance:**\n- Flexible work arrangements\n- Employee Assistance Program (confidential counseling)\n- Wellness programs with premium discounts\n- Professional development opportunities\n\n**Family Benefits:**\n- Maternity/Paternity leave\n- Dependent care FSA\n- Family medical coverage options\n- Adoption assistance program\n\n**Getting Started:**\nNew employees have 30 days to enroll. Schedule a benefits consultation with our team at benefits@company.com or call ext. 2469.\n\nWhat specific aspect of our benefits would you like to explore further?"
        ][Math.floor(Math.random() * 2)];
      }
      return [
        "Welcome to HR Support! I'm here to assist you with all human resources related questions and concerns.\n\n**Areas I Can Help With:**\n\n**Benefits & Compensation:**\n- Health, dental, and vision insurance\n- 401(k) and retirement planning\n- Flexible spending accounts\n- Life and disability insurance\n- Salary and bonus information\n\n**Time Off & Leave:**\n- PTO requests and balances\n- Sick leave policies\n- FMLA and family leave\n- Bereavement and personal leave\n- Holiday schedules\n\n**Policies & Procedures:**\n- Employee handbook questions\n- Code of conduct\n- Performance review process\n- Disciplinary procedures\n- Workplace policies\n\n**Career Development:**\n- Training and development opportunities\n- Tuition reimbursement\n- Internal job postings\n- Performance improvement resources\n\n**Workplace Issues:**\n- Conflict resolution\n- Harassment or discrimination concerns\n- Accommodation requests\n- Employee relations\n\n**Administrative Support:**\n- Payroll questions\n- Address or emergency contact changes\n- Employment verification\n- Tax document requests\n\n**Confidential Matters:**\nFor sensitive issues, you can always request a private meeting or call our confidential hotline.\n\nWhat HR topic can I help you with today?",
        "Hello! I'm your HR Support assistant, ready to help with any human resources questions or concerns you may have.\n\n**Quick Access Resources:**\n- **Employee Portal**: Access pay stubs, benefits, and personal information\n- **HR Handbook**: Complete policies and procedures guide\n- **Benefits Summary**: Overview of all available benefits\n- **Emergency Contacts**: Important HR phone numbers and emails\n\n**Common Requests I Handle:**\n\n**🏥 Benefits Questions**\n- Insurance enrollment and changes\n- Claims assistance\n- FSA and HSA information\n- Retirement plan guidance\n\n**📅 Time Off Management**\n- PTO balance inquiries\n- Leave request procedures\n- FMLA eligibility\n- Holiday schedules\n\n**📋 Policy Clarification**\n- Workplace guidelines\n- Performance expectations\n- Compliance requirements\n- Code of conduct\n\n**💼 Career Support**\n- Professional development\n- Internal opportunities\n- Training programs\n- Performance resources\n\n**🤝 Employee Relations**\n- Workplace concerns\n- Conflict resolution\n- Accommodation requests\n- Confidential reporting\n\n**Contact Information:**\n- Email: hr@company.com\n- Phone: ext. 2468\n- Emergency HR Line: ext. 911\n\nHow can I assist you today? Please feel free to ask about any HR-related topic!"
      ][Math.floor(Math.random() * 2)];
    }

    if (assistantName === 'Coding Assistant') {
      if (message.includes('business rule') && message.includes('hello world') && message.includes('error')) {
        return `I'll help you create a business rule that presents "Hello World" as an error message. Here's a comprehensive solution:

**Simple Error Display Rule:**

\`\`\`javascript
// Basic business rule function
function displayHelloWorldError() {
  throw new Error("Hello World");
}

// Or for user-friendly display
function showHelloWorldErrorMessage() {
  return {
    success: false,
    error: "Hello World",
    message: "Hello World",
    type: "error"
  };
}
\`\`\`

**Frontend Implementation:**

\`\`\`javascript
// React component example
function ErrorDisplay() {
  const [error, setError] = useState(null);
  
  const triggerHelloWorldError = () => {
    setError("Hello World");
  };
  
  return (
    <div>
      <button onClick={triggerHelloWorldError}>
        Trigger Error
      </button>
      {error && (
        <div className="error-message" style={{
          color: 'red',
          padding: '10px',
          border: '1px solid red',
          borderRadius: '4px',
          backgroundColor: '#ffebee'
        }}>
          Error: {error}
        </div>
      )}
    </div>
  );
}
\`\`\`

**Backend API Rule:**

\`\`\`javascript
// Express.js endpoint
app.post('/api/trigger-hello-world-error', (req, res) => {
  // Business rule: Always return "Hello World" as error
  res.status(400).json({
    success: false,
    error: "Hello World",
    timestamp: new Date().toISOString()
  });
});
\`\`\`

**Database Trigger Example:**

\`\`\`sql
-- SQL trigger that creates "Hello World" error log
CREATE TRIGGER hello_world_error_trigger
BEFORE INSERT ON user_actions
FOR EACH ROW
BEGIN
  INSERT INTO error_logs (message, severity, created_at)
  VALUES ('Hello World', 'ERROR', NOW());
END;
\`\`\`

**Validation Rule:**

\`\`\`javascript
// Form validation that shows "Hello World" error
function validateForm(data) {
  const errors = {};
  
  // Business rule: Always show "Hello World" error
  errors.general = "Hello World";
  
  return {
    isValid: false,
    errors: errors
  };
}
\`\`\`

Would you like me to elaborate on any specific implementation or add additional error handling features?`;
      }
      
      if (message.includes('business rule')) {
        return `I can help you create a business rule! Based on your request: "${userMessage}"

Here's a general business rule structure:

\`\`\`javascript
function businessRule(input) {
  // Define your conditions
  if (/* your condition */) {
    return /* your result */;
  }
  
  // Default case
  return /* default result */;
}
\`\`\`

Could you provide more specific details about:
1. What conditions should trigger the rule?
2. What actions should be taken?
3. What data you're working with?

This will help me create a more targeted solution for your needs.`;
      }
      
      if (message.includes('code') || message.includes('function') || message.includes('programming')) {
        return `I'd be happy to help you with coding! You mentioned: "${userMessage}"

Let me provide assistance based on your specific request. Could you share more details about:
- What programming language you're using
- What you're trying to accomplish
- Any specific requirements or constraints
- Current code (if you have any)
- Best practices and architecture
- Testing strategies

**💻 Code Development:**
- Writing functions, classes, and applications
- Implementing algorithms and data structures
- Creating APIs and web services
- Code optimization
- Best practices review
- Database schema design

Please provide more context about your coding needs, and I'll help you create an efficient and maintainable solution.`;
      }
      
      return `Hello! I'm your Coding Assistant. You said: "${userMessage}"

I can help you with various programming and development tasks:

**Areas of Expertise:**
- Algorithm Design & Implementation
- Code Review & Optimization
- Debugging & Problem Solving
- API Development
- Database Design
- Testing Strategies
- Best Practices & Design Patterns

What specific coding challenge would you like help with?`;
    }

    // Default response for any assistant
    return `Hello! I'm ${assistantName}. You said: "${userMessage}"

I'm here to provide you with comprehensive assistance tailored to your specific needs. Based on your message, I can help you with detailed analysis, problem-solving, and actionable guidance.

Could you provide a bit more context about what you're looking for? This will help me give you the most relevant and helpful response.

What specific aspect would you like me to focus on?`;
  }

  deleteThread(threadId: string) {
    this.threads.delete(threadId);
    this.streamingCallbacks.delete(threadId);
    this.activeStreamingThreads.delete(threadId);
    if (this.currentThreadId === threadId) {
      this.currentThreadId = null;
    }
    this.saveThreadsToStorage();
  }

  clearAllThreads() {
    this.threads.clear();
    this.currentThreadId = null;
    this.streamingCallbacks.clear();
    this.activeStreamingThreads.clear();
    this.saveThreadsToStorage();
  }

  // Method to integrate with real OpenAI API (requires backend proxy)

  // Method to check if a thread is currently streaming
  isThreadStreaming(threadId: string): boolean {
    return this.activeStreamingThreads.has(threadId);
  }

  // Method to register a new streaming callback (for when component remounts)
  registerStreamingCallback(threadId: string, callback: (chunk: string) => void): void {
    if (this.activeStreamingThreads.has(threadId)) {
      this.streamingCallbacks.set(threadId, callback);
    }
  }

  // Method to unregister streaming callback (for when component unmounts)
  unregisterStreamingCallback(threadId: string): void {
    this.streamingCallbacks.delete(threadId);
  }
}

export const chatService = new ChatService();
export type { ChatMessage, ChatThread };