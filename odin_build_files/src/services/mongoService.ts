// MongoDB Service for handling prompt data
import { getCompanyBotName } from '../utils/companyConfig';

export interface MongoPrompt {
  id: string;
  title: string;
  description: string;
  assistant: string;
  task?: string;
  functionalArea?: string;
  tags: string[];
  user?: string;
  system?: string;
  owner?: string;
}

// n8n webhook configuration
interface N8nConfig {
  getWebhookUrl: string | undefined;
  createWebhookUrl: string | undefined;
  updateWebhookUrl: string | undefined;
  deleteWebhookUrl: string | undefined;
  isConfigured: boolean;
}

// Fallback prompts data when MongoDB is not connected
const FALLBACK_PROMPTS: MongoPrompt[] = [
  {
    "id": "1",
    "title": "Brainstorm ideas for a new marketing campaign.",
    "description": "Generate creative ideas and strategies for an upcoming marketing campaign.",
    "assistant": getCompanyBotName(),
    "tags": ["Marketing", "Brainstorming"]
  },
  {
    "id": "2",
    "title": "Write a short story about a futuristic city.",
    "description": "Create a captivating short story set in a technologically advanced, futuristic urban environment.",
    "assistant": getCompanyBotName(),
    "tags": ["Creative Writing", "Fiction"]
  },
  {
    "id": "3",
    "title": "Explain the concept of quantum entanglement simply.",
    "description": "Provide a clear and easy-to-understand explanation of quantum entanglement for a general audience.",
    "assistant": getCompanyBotName(),
    "tags": ["Science", "Education"]
  },
  {
    "id": "4",
    "title": "Summarize the key points of the attached research paper.",
    "description": "Condense the essential information and main findings from the provided research paper.",
    "assistant": getCompanyBotName(),
    "task": "Files",
    "tags": ["Summarization", "Research", "Files"]
  },
  {
    "id": "5",
    "title": "Generate a list of interview questions for a software engineer role.",
    "description": "Formulate relevant and insightful interview questions suitable for evaluating candidates for a software engineer position.",
    "assistant": getCompanyBotName(),
    "tags": ["Hiring", "HR"]
  },
  {
    "id": "6",
    "title": "How do I troubleshoot a printer that isn't printing?",
    "description": "Provide step-by-step instructions for diagnosing and resolving common printer issues.",
    "assistant": "IT Support",
    "tags": ["Troubleshooting", "Hardware"]
  },
  {
    "id": "7",
    "title": "My email is not syncing. What should I do?",
    "description": "Offer guidance on troubleshooting email synchronization problems across various platforms.",
    "assistant": "IT Support",
    "tags": ["Email", "Troubleshooting"]
  },
  {
    "id": "8",
    "title": "I forgot my password for the company VPN. How can I reset it?",
    "description": "Explain the procedure for resetting a forgotten VPN password.",
    "assistant": "IT Support",
    "tags": ["Password Reset", "Security"]
  },
  {
    "id": "9",
    "title": "How can I connect to the office Wi-Fi network?",
    "description": "Provide instructions for connecting a device to the company's wireless network.",
    "assistant": "IT Support",
    "tags": ["Network", "Connectivity"]
  },
  {
    "id": "10",
    "title": "My computer is running very slowly. Any tips?",
    "description": "Suggest common methods to improve the performance of a slow computer.",
    "assistant": "IT Support",
    "tags": ["Performance", "Troubleshooting"]
  },
  {
    "id": "11",
    "title": "What are the company's policies on paid time off (PTO)?",
    "description": "Provide details regarding the company's policy on vacation, sick leave, and other forms of paid time off.",
    "assistant": "HR Support",
    "tags": ["Benefits", "Policies"]
  },
  {
    "id": "12",
    "title": "How do I submit an expense report?",
    "description": "Outline the process and requirements for submitting employee expense reports.",
    "assistant": "HR Support",
    "tags": ["Expenses", "Procedures"]
  },
  {
    "id": "13",
    "title": "What is the procedure for requesting a leave of absence?",
    "description": "Explain the steps involved in formally requesting a leave of absence from work.",
    "assistant": "HR Support",
    "tags": ["Leave", "Policies"]
  },
  {
    "id": "14",
    "title": "Can you explain the health insurance benefits available to employees?",
    "description": "Detail the various health insurance plans and benefits offered to employees.",
    "assistant": "HR Support",
    "tags": ["Benefits", "Insurance"]
  },
  {
    "id": "15",
    "title": "What is the company's code of conduct?",
    "description": "Provide an overview of the company's ethical guidelines and behavioral expectations.",
    "assistant": "HR Support",
    "tags": ["Policies", "Ethics"]
  },
  {
    "id": "16",
    "title": "Summarize the key takeaways from the 'Employee Handbook' policy document.",
    "description": "Extract and present the most important information from the company's employee handbook.",
    "assistant": "Advance Policies Assistant",
    "task": "Files",
    "tags": ["Policy Analysis", "Summarization", "Files"]
  },
  {
    "id": "17",
    "title": "Explain the implications of the 'Remote Work Policy' on travel expenses.",
    "description": "Clarify how the remote work policy impacts employee travel expense reimbursement.",
    "assistant": "Advance Policies Assistant",
    "tags": ["Policy Interpretation", "Remote Work"]
  },
  {
    "id": "18",
    "title": "Compare the 'Data Privacy Policy' with GDPR regulations.",
    "description": "Analyze and highlight the similarities and differences between the company's data privacy policy and GDPR.",
    "assistant": "Advance Policies Assistant",
    "tags": ["Compliance", "Legal", "Data Privacy"]
  },
  {
    "id": "19",
    "title": "What are the disciplinary actions outlined in the 'HR Disciplinary Policy'?",
    "description": "List and explain the disciplinary measures detailed in the HR disciplinary policy.",
    "assistant": "Advance Policies Assistant",
    "tags": ["HR", "Policy Enforcement"]
  },
  {
    "id": "20",
    "title": "Provide a concise summary of the 'IT Security Policy' for new hires.",
    "description": "Create a brief and easy-to-understand summary of the IT security policy specifically for onboarding new employees.",
    "assistant": "Advance Policies Assistant",
    "tags": ["Onboarding", "IT Security"]
  },
  {
    "id": "21",
    "title": "Redact all personal identifiable information (PII) from this document.",
    "description": "Automatically identify and remove all sensitive personal data from the provided document.",
    "assistant": "Redact Assistant",
    "task": "Files",
    "tags": ["Data Privacy", "Redaction", "Files"]
  },
  {
    "id": "22",
    "title": "Find and redact all financial figures and account numbers in the attached report.",
    "description": "Locate and obscure all monetary values and banking details within the given financial report.",
    "assistant": "Redact Assistant",
    "task": "Files",
    "tags": ["Financial Data", "Redaction", "Files"]
  },
  {
    "id": "23",
    "title": "Anonymize all names and addresses in this research dataset.",
    "description": "Replace all names and residential addresses with generic identifiers to ensure anonymity in the dataset.",
    "assistant": "Redact Assistant",
    "task": "Files",
    "tags": ["Anonymization", "Research", "Files"]
  },
  {
    "id": "24",
    "title": "Remove all references to internal project names from this public-facing document.",
    "description": "Eliminate any mentions of internal project codenames or confidential project identifiers from the document intended for public release.",
    "assistant": "Redact Assistant",
    "task": "Files",
    "tags": ["Confidentiality", "Public Relations", "Files"]
  },
  {
    "id": "25",
    "title": "Censor sensitive legal case details in this court transcript.",
    "description": "Apply appropriate redaction to sensitive and private information found within the court transcript to comply with legal privacy requirements.",
    "assistant": "Redact Assistant",
    "task": "Files",
    "tags": ["Legal", "Privacy", "Files"]
  },
  {
    "id": "26",
    "title": "Extract names and addresses from scanned invoices and input them into a spreadsheet.",
    "description": "Automatically read and transfer customer names and billing addresses from scanned invoices into a structured spreadsheet format.",
    "assistant": "ADEPT Assistant",
    "task": "Files",
    "tags": ["Data Entry", "Automation", "Files"]
  },
  {
    "id": "27",
    "title": "Categorize incoming support tickets based on keywords and assign them to departments.",
    "description": "Analyze the content of new support tickets, identify keywords, and automatically route them to the appropriate support department.",
    "assistant": "ADEPT Assistant",
    "task": "Files",
    "tags": ["Ticketing", "Workflow Automation", "Files"]
  },
  {
    "id": "28",
    "title": "Validate customer information in a database against a provided list.",
    "description": "Cross-reference customer data in an existing database with a given list to identify discrepancies or confirm accuracy.",
    "assistant": "ADEPT Assistant",
    "task": "Files",
    "tags": ["Data Validation", "Database Management", "Files"]
  },
  {
    "id": "29",
    "title": "Automate data extraction from expense receipts and populate an expense report template.",
    "description": "Parse relevant information (e.g., vendor, amount, date) from uploaded expense receipts and automatically fill out a predefined expense report form.",
    "assistant": "ADEPT Assistant",
    "task": "Files",
    "tags": ["Expense Management", "OCR", "Files"]
  },
  {
    "id": "30",
    "title": "Convert handwritten notes from meeting minutes into structured text for archiving.",
    "description": "Process images of handwritten meeting notes and transcribe them into searchable, digital text for easy archiving and retrieval.",
    "assistant": "ADEPT Assistant",
    "task": "Files",
    "tags": ["Transcription", "Archiving", "Files"]
  },
  {
    "id": "31",
    "title": "Draft a response to an RFP for IT services, highlighting our cybersecurity expertise.",
    "description": "Generate a comprehensive response to a Request for Proposal (RFP) for IT services, emphasizing the company's strengths in cybersecurity.",
    "assistant": "RFP Assistant",
    "tags": ["RFP", "IT Services", "Cybersecurity"]
  },
  {
    "id": "32",
    "title": "Tailor our standard RFP template to address the specific requirements of the healthcare industry.",
    "description": "Adapt and customize the existing RFP template to meet the unique needs and regulatory considerations of the healthcare sector.",
    "assistant": "RFP Assistant",
    "tags": ["RFP Customization", "Healthcare"]
  },
  {
    "id": "33",
    "title": "Identify and address all mandatory compliance requirements from the attached RFP document.",
    "description": "Review the provided RFP document to pinpoint all compulsory compliance clauses and suggest appropriate responses.",
    "assistant": "RFP Assistant",
    "task": "Files",
    "tags": ["Compliance", "RFP Analysis", "Files"]
  },
  {
    "id": "34",
    "title": "Suggest competitive pricing strategies for an RFP on cloud computing solutions.",
    "description": "Propose effective pricing models and strategies to win an RFP for cloud computing services.",
    "assistant": "RFP Assistant",
    "tags": ["Pricing", "Cloud Computing"]
  },
  {
    "id": "35",
    "title": "Generate a concise executive summary for our RFP submission for a government contract.",
    "description": "Create a brief yet impactful executive summary for the RFP response, tailored for a government contract bid.",
    "assistant": "RFP Assistant",
    "tags": ["Executive Summary", "Government Contracts"]
  },
  {
    "id": "36",
    "title": "Create a resume for a marketing manager with 5 years of experience in digital campaigns.",
    "description": "Develop a professional resume for a marketing manager, showcasing experience in digital marketing campaigns.",
    "assistant": "Resume Assistant",
    "tags": ["Resume Writing", "Marketing"]
  },
  {
    "id": "37",
    "title": "Optimize my current resume for a software developer position at a tech startup.",
    "description": "Refine and enhance an existing resume to align with the requirements of a software developer role at a technology startup.",
    "assistant": "Resume Assistant",
    "task": "Files",
    "tags": ["Resume Optimization", "Software Development", "Files"]
  },
  {
    "id": "38",
    "title": "Write a compelling cover letter to accompany my resume for a project management role.",
    "description": "Draft a persuasive cover letter designed to complement a resume for a project management position.",
    "assistant": "Resume Assistant",
    "tags": ["Cover Letter", "Project Management"]
  },
  {
    "id": "39",
    "title": "Highlight my leadership skills and team achievements in my resume for a senior leadership role.",
    "description": "Emphasize leadership capabilities and significant team accomplishments within the resume for a senior management or executive position.",
    "assistant": "Resume Assistant",
    "tags": ["Leadership", "Resume Content"]
  },
  {
    "id": "40",
    "title": "Suggest action verbs and industry-specific keywords to improve my resume for a healthcare administration job.",
    "description": "Provide a list of powerful action verbs and relevant keywords specific to the healthcare administration industry to enhance resume impact.",
    "assistant": "Resume Assistant",
    "tags": ["Keywords", "Healthcare", "Resume Improvement"]
  }
];

class MongoService {
  private n8nConfig: N8nConfig;
  private cachedPrompts: MongoPrompt[] | null = null;
  private cacheTimestamp: number = 0;
  private cacheExpiryMs = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // Read n8n webhook URLs from environment variables only
    this.n8nConfig = {
      getWebhookUrl: import.meta.env.VITE_N8N_GET_WEBHOOK_URL,
      createWebhookUrl: import.meta.env.VITE_N8N_CREATE_WEBHOOK_URL,
      updateWebhookUrl: import.meta.env.VITE_N8N_UPDATE_WEBHOOK_URL,
      deleteWebhookUrl: import.meta.env.VITE_N8N_DELETE_WEBHOOK_URL,
      isConfigured: !!(import.meta.env.VITE_N8N_GET_WEBHOOK_URL && import.meta.env.VITE_N8N_CREATE_WEBHOOK_URL)
    };
  }

  async getPrompts(forceRefresh: boolean = false): Promise<MongoPrompt[]> {
    // Check cache first unless force refresh is requested
    if (!forceRefresh && this.cachedPrompts && (Date.now() - this.cacheTimestamp) < this.cacheExpiryMs) {
      console.log('Returning cached prompts');
      return this.cachedPrompts;
    }

    try {
      // Try to fetch from n8n webhook first
      if (this.n8nConfig.isConfigured && this.n8nConfig.getWebhookUrl) {
        console.log('Fetching prompts from n8n GET webhook:', this.n8nConfig.getWebhookUrl);
        
        try {
          const response = await fetch(this.n8nConfig.getWebhookUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error(`n8n webhook responded with status: ${response.status}`);
          }

          const data = await response.json();
          
          // Handle different response formats from n8n/MongoDB
          let prompts: MongoPrompt[];
          if (Array.isArray(data)) {
            // Direct array of prompts
            prompts = data;
          } else if (data.prompts && Array.isArray(data.prompts)) {
            // Wrapped in prompts property
            prompts = data.prompts;
          } else if (data.data && Array.isArray(data.data)) {
            // Wrapped in data property
            prompts = data.data;
          } else if (data && typeof data === 'object') {
            // Check if it's a single prompt object or contains prompt data
            if (data.id && data.title && data.description && data.assistant) {
              // Single prompt object
              prompts = [data];
            } else {
              // Try to find prompts in nested structure
              const possibleArrays = Object.values(data).filter(Array.isArray);
              if (possibleArrays.length > 0) {
                prompts = possibleArrays[0] as MongoPrompt[];
              } else {
                throw new Error('No valid prompt array found in response');
              }
            }
          } else {
            throw new Error('Invalid response format from n8n webhook');
          }

          // Validate and transform the data to match our interface
          const validatedPrompts = prompts.map((prompt: any) => ({
            id: prompt.id || Math.random().toString(36).substr(2, 9),
            title: prompt.title || 'Untitled Prompt',
            description: prompt.description || '',
            assistant: prompt.assistant || 'OmniChat',
            task: prompt.task,
            functionalArea: prompt.functionalArea,
            tags: Array.isArray(prompt.tags) ? prompt.tags : [],
            user: prompt.user || '',
            system: prompt.system || '',
            owner: prompt.owner || ''
          }
          )
          )

          console.log(`Successfully loaded ${validatedPrompts.length} prompts from n8n`);
          
          // Cache the results
          this.cachedPrompts = validatedPrompts;
          this.cacheTimestamp = Date.now();
          return validatedPrompts;
        } catch (fetchError) {
          // Handle specific fetch errors
          if (fetchError instanceof TypeError && fetchError.message === 'Failed to fetch') {
            console.warn('n8n webhook is not accessible. This could be due to:');
            console.warn('1. n8n server is not running');
            console.warn('2. Network connectivity issues');
            console.warn('3. CORS policy blocking the request');
            console.warn('4. Incorrect webhook URL');
          } else {
            console.error('Error fetching from n8n webhook:', fetchError);
          }
          throw fetchError;
        }
      }
        
      // Return fallback data when MongoDB is not configured
      console.log('n8n webhook not configured, using fallback data');
      
      // Cache fallback data too
      this.cachedPrompts = FALLBACK_PROMPTS;
      this.cacheTimestamp = Date.now();
      return FALLBACK_PROMPTS;
    } catch (error) {
      console.log('Falling back to static prompt data');
      return FALLBACK_PROMPTS;
    }
  }

  async getPromptsByAssistant(assistant: string): Promise<MongoPrompt[]> {
    const allPrompts = await this.getPrompts();
    return allPrompts.filter(prompt => prompt.assistant === assistant);
  }

  async searchPrompts(query: string): Promise<MongoPrompt[]> {
    const allPrompts = await this.getPrompts();
    const searchRegex = new RegExp(query, 'i');
    
    return allPrompts.filter(prompt => 
      searchRegex.test(prompt.title) ||
      searchRegex.test(prompt.description) ||
      prompt.tags.some(tag => searchRegex.test(tag))
    );
  }

  async addPrompt(prompt: Omit<MongoPrompt, '_id'>): Promise<boolean> {
    try {
      if (!this.n8nConfig.isConfigured || !this.n8nConfig.createWebhookUrl) {
        console.warn('n8n webhook not configured for adding prompts');
        return false;
      }

      console.log('Adding prompt via n8n CREATE webhook:', this.n8nConfig.createWebhookUrl);
      
      const response = await fetch(this.n8nConfig.createWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: prompt })
      });

      if (!response.ok) {
        throw new Error(`Failed to add prompt: ${response.status}`);
      }

      console.log('Successfully added prompt via n8n webhook');
      
      // Clear cache to force refresh on next load
      this.cachedPrompts = null;
      this.cacheTimestamp = 0;
      
      return true;
    } catch (error) {
      // Provide detailed diagnostic information
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        console.warn('n8n webhook connection failed. Possible causes:');
        console.warn('1. n8n server is not running or not accessible');
        console.warn('2. CREATE Webhook URL is incorrect:', this.n8nConfig.createWebhookUrl);
        console.warn('3. CORS policy is blocking the request');
        console.warn('4. Network connectivity issues');
        console.warn('Please check your VITE_N8N_CREATE_WEBHOOK_URL environment variable and n8n server status');
      } else {
        console.error('Error adding prompt via n8n webhook:', error);
      }
      
      // Return false instead of throwing to allow graceful handling
      return false;
    }
  }

  async updatePrompt(id: string, updates: Partial<MongoPrompt>): Promise<boolean> {
    try {
      if (!this.n8nConfig.isConfigured || !this.n8nConfig.updateWebhookUrl) {
        console.warn('n8n webhook not configured for updating prompts');
        return false;
      }

      console.log('Updating prompt via n8n UPDATE webhook:', this.n8nConfig.updateWebhookUrl);
      
      const response = await fetch(this.n8nConfig.updateWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          data: {
            id: id,
            ...updates
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to update prompt: ${response.status}`);
      }

      console.log('Successfully updated prompt via n8n webhook');
      return true;
    } catch (error) {
      console.error('Error updating prompt via n8n webhook:', error);
      return false;
    }
  }

  async deletePrompt(id: string): Promise<boolean> {
    try {
      if (!this.n8nConfig.isConfigured || !this.n8nConfig.deleteWebhookUrl) {
        console.warn('n8n webhook not configured for deleting prompts');
        return false;
      }

      console.log('Deleting prompt via n8n DELETE webhook:', this.n8nConfig.deleteWebhookUrl);
      
      const response = await fetch(this.n8nConfig.deleteWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          data: {
            id: id
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to delete prompt: ${response.status}`);
      }

      console.log('Successfully deleted prompt via n8n webhook');
      return true;
    } catch (error) {
      // Provide detailed diagnostic information
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        console.warn('n8n webhook connection failed. Possible causes:');
        console.warn('1. n8n server is not running or not accessible');
        console.warn('2. DELETE Webhook URL is incorrect:', this.n8nConfig.deleteWebhookUrl);
        console.warn('3. CORS policy is blocking the request');
        console.warn('4. Network connectivity issues');
        console.warn('Please check your VITE_N8N_DELETE_WEBHOOK_URL environment variable and n8n server status');
      } else {
        console.error('Error deleting prompt via n8n webhook:', error);
      }
      return false;
    }
  }

  isMongoConnected(): boolean {
    return this.n8nConfig.isConfigured;
  }

  getConnectionInfo() {
    return {
      getWebhookUrl: this.n8nConfig.getWebhookUrl || 'Not configured',
      createWebhookUrl: this.n8nConfig.createWebhookUrl || 'Not configured',
      updateWebhookUrl: this.n8nConfig.updateWebhookUrl || 'Not configured',
      deleteWebhookUrl: this.n8nConfig.deleteWebhookUrl || 'Not configured',
      isConfigured: this.n8nConfig.isConfigured,
      source: 'n8n webhook'
    };
  }
}

export const mongoService = new MongoService();
export type { MongoPrompt };