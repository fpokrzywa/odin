// Service for handling Automate Tasks data from n8n webhook
export interface AutomationAgent {
  id: string;
  agentName: string;
  content: string;
  category?: string;
  tools: AutomationTool[];
  url?: string;
  lastUpdated?: string;
  author?: string;
  agentID?: string;
  isExpanded?: boolean;
}

export interface AutomationTool {
  id: string;
  toolName: string;
  description: string;
}

export interface AutomateTasksItem {
  id: string;
  title: string;
  description: string;
  icon?: string;
  data: AutomationsData;
}

export interface AutomationsData {
  title: string;
  description: string;
  scenario?: string;
  actions?: string[];
  tryItYourself: {
    scenario: string;
    actions: string[];
  };
  agents: AutomationAgent[];
  learnMoreLink?: string;
}

export interface AutomateTasksResponse {
  items: AutomateTasksItem[];
}

class AutomationsService {
  private webhookUrl: string | undefined;
  private cachedItems: AutomateTasksResponse | null = null;
  private cachedItemData: Map<string, AutomationsData> = new Map();
  private cacheTimestamp: number = 0;
  private cacheExpiryMs = 10 * 60 * 1000; // 10 minutes for better performance

  constructor() {
    this.webhookUrl = import.meta.env.VITE_N8N_AUTOMATIONS_WEBHOOK_URL;
  }

  async getAutomateTasksItems(forceRefresh: boolean = false): Promise<AutomateTasksResponse> {
    // Check cache first unless force refresh is requested
    if (!forceRefresh && this.cachedItems && (Date.now() - this.cacheTimestamp) < this.cacheExpiryMs) {
      console.log('📋 AutomationsService: Returning cached automations', this.cachedItems.items.length, 'items');
      return this.cachedItems;
    }

    try {
      if (this.webhookUrl) {
        console.log('🔗 AutomationsService: Attempting to fetch from webhook:', this.webhookUrl);
        
        try {
          const response = await fetch(this.webhookUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error(`n8n webhook responded with status: ${response.status} - ${response.statusText}`);
          }

          const data = await response.json();
          console.log('📦 AutomationsService: Raw webhook response:', data);
          
          // Log the structure of the first item to understand the data format
          if (Array.isArray(data) && data.length > 0) {
            console.log('📋 AutomationsService: First item structure:', data[0]);
          }
          
          // Transform the webhook data to match our interface
          const automateTasksData = this.transformWebhookData(data);
          console.log('🔄 AutomationsService: Transformed data:', automateTasksData);
          
          // Cache the results
          this.cachedItems = automateTasksData;
          this.cacheTimestamp = Date.now();
          
          // Cache individual item data for faster access
          automateTasksData.items.forEach(item => {
            this.cachedItemData.set(item.id, item.data);
          });
          
          console.log('✅ AutomationsService: Successfully loaded automations from webhook');
          return automateTasksData;
        } catch (fetchError) {
          console.error('❌ AutomationsService: Webhook fetch failed:', fetchError);
          if (fetchError instanceof TypeError && fetchError.message === 'Failed to fetch') {
            console.warn('🚫 AutomationsService: Network error - webhook not accessible');
            console.warn('   Possible causes:');
            console.warn('   1. Webhook URL incorrect:', this.webhookUrl);
            console.warn('   2. CORS not configured on webhook server');
            console.warn('   3. Network connectivity issues');
            console.warn('   4. Webhook server not running');
          }
          throw fetchError;
        }
      }
      
      // Fallback data when webhook is not configured
      console.log('⚠️ AutomationsService: No webhook URL configured');
      console.log('💡 AutomationsService: Set VITE_N8N_AUTOMATIONS_WEBHOOK_URL in .env to use webhook');
      const fallbackData = this.getFallbackData();
      
      // Cache fallback data too
      this.cachedItems = fallbackData;
      this.cacheTimestamp = Date.now();
      
      // Cache individual item data
      fallbackData.items.forEach(item => {
        this.cachedItemData.set(item.id, item.data);
      });
      
      return fallbackData;
    } catch (error) {
      console.error('❌ AutomationsService: Error in getAutomateTasksItems:', error);
      console.log('⚠️ AutomationsService: Using fallback data due to error');
      
      // Use fallback data when webhook fails
      const fallbackData = this.getFallbackData();
      
      // Cache fallback data
      this.cachedItems = fallbackData;
      this.cacheTimestamp = Date.now();
      
      // Cache individual item data
      fallbackData.items.forEach(item => {
        this.cachedItemData.set(item.id, item.data);
      });
      
      return this.getFallbackData();
    }
  }

  async getAutomationsForItem(itemId: string): Promise<AutomationsData | null> {
    // Check cache first for individual item data
    if (this.cachedItemData.has(itemId) && (Date.now() - this.cacheTimestamp) < this.cacheExpiryMs) {
      console.log('📋 AutomationsService: Returning cached item data for', itemId);
      return this.cachedItemData.get(itemId) || null;
    }
    
    // If not in cache, load all items and cache them
    const automateTasksData = await this.getAutomateTasksItems();
    const item = automateTasksData.items.find(item => item.id === itemId);
    
    if (item) {
      // Cache this specific item data
      this.cachedItemData.set(itemId, item.data);
      return item.data;
    }
    
    return null;
  }
  
  // Method to clear cache if needed
  clearCache(): void {
    this.cachedItems = null;
    this.cachedItemData.clear();
    this.cacheTimestamp = 0;
    console.log('🗑️ AutomationsService: Cache cleared');
  }
  
  // Method to get cache status
  getCacheStatus(): { hasCache: boolean; age: number; itemCount: number } {
    const age = Date.now() - this.cacheTimestamp;
    return {
      hasCache: !!this.cachedItems,
      age: Math.floor(age / 1000), // age in seconds
      itemCount: this.cachedItemData.size
    };
  }

  private transformWebhookData(data: any): AutomateTasksResponse {
    // Handle the actual webhook data structure
    let rawItems: any[];
    
    if (Array.isArray(data)) {
      rawItems = data;
    } else if (data.items && Array.isArray(data.items)) {
      rawItems = data.items;
    } else if (data.data && Array.isArray(data.data)) {
      rawItems = data.data;
    } else {
      // Single item response
      rawItems = [data];
    }

    // Transform items to match our interface - handle multiple items from webhook
    const items = rawItems.map((item: any) => ({
      id: item.id || item._id?.toString() || Math.random().toString(36).substr(2, 9),
      title: item.title || 'Untitled Automation',
      description: item.description || '',
      icon: item.icon,
      data: {
        title: item.title || 'Automation Task',
        description: item.description || 'Automate tasks and workflows.',
        scenario: item.scenario,
        actions: item.actions,
        tryItYourself: {
          scenario: item.scenario || `Explore ${item.title || 'this automation'} to streamline your workflow.`,
          actions: item.actions || [
            `Use ${item.title?.toLowerCase() || 'this automation'} to automate tasks`,
            'Get instant workflow automation',
            'Streamline repetitive processes'
          ]
        },
        agents: this.processAgents(item),
        learnMoreLink: item.learnMoreLink || `Learn more about ${item.title}`
      }
    }));

    console.log('🔄 AutomationsService: Transformed items:', items.map(item => ({ id: item.id, title: item.title })));
    return { items };
  }

  private processAgents(item: any): AutomationAgent[] {
    // Process agents array with tools
    if (item.agents && Array.isArray(item.agents) && item.agents.length > 0) {
      console.log('📋 AutomationsService: Processing agents array found:', item.agents.length, 'agents');
      return item.agents.map((agent: any, agentIndex: number) => ({
        id: agent.id || agent._id || `agent-${agentIndex}`,
        agentName: agent.agentName || agent.name || agent.title || `Agent ${agentIndex + 1}`,
        content: agent.content || agent.description || agent.body || `Sample content for ${agent.agentName?.toLowerCase() || 'this agent'}...`,
        category: agent.category,
        tools: this.processTools(agent.tools || []),
        isExpanded: false,
        url: agent.url,
        lastUpdated: agent.lastUpdated || agent.updated_at,
        author: agent.author,
        agentID: agent.agentID || agent.agent_id || agent.agentId
      }));
    }
    
    // No agents array - return empty array
    console.log('📋 AutomationsService: No agents array, returning empty agents');
    return [];
  }

  private processTools(tools: any[]): AutomationTool[] {
    if (!Array.isArray(tools)) return [];
    
    return tools.map((tool: any, toolIndex: number) => ({
      id: tool.id || tool._id || `tool-${toolIndex}`,
      toolName: tool.toolName || tool.name || tool.title || `Tool ${toolIndex + 1}`,
      description: tool.description || tool.desc || `Tool description for ${tool.toolName || 'this tool'}`
    }));
  }

  private getFallbackData(): AutomateTasksResponse {
    return {
      items: [
        {
          id: 'get-software-apps',
          title: 'Get Software Apps',
          description: 'Request and download approved software applications for your work.',
          data: {
            title: 'Get Software Apps',
            description: 'Request and download approved software applications for your work.',
            tryItYourself: {
              scenario: 'Automate software requests and downloads for your team.',
              actions: [
                'Submit software requests automatically',
                'Get approval workflows',
                'Download approved applications'
              ]
            },
            agents: [],
            learnMoreLink: 'Learn more about Software Management'
          }
        },
        {
          id: 'track-support-tickets',
          title: 'Track Support Tickets',
          description: 'Track and update your IT support tickets and requests.',
          data: {
            title: 'Track Support Tickets',
            description: 'Track and update your IT support tickets and requests.',
            tryItYourself: {
              scenario: 'Automate support ticket management and tracking.',
              actions: [
                'Auto-track ticket status',
                'Get real-time updates',
                'Streamline support workflows'
              ]
            },
            agents: [],
            learnMoreLink: 'Learn more about Support Management'
          }
        },
        {
          id: 'manage-email-groups',
          title: 'Manage Email Groups',
          description: 'Manage your email group memberships and distribution lists.',
          data: {
            title: 'Manage Email Groups',
            description: 'Manage your email group memberships and distribution lists.',
            tryItYourself: {
              scenario: 'Automate email group management and distribution.',
              actions: [
                'Auto-manage group memberships',
                'Update distribution lists',
                'Streamline email workflows'
              ]
            },
            agents: [],
            learnMoreLink: 'Learn more about Email Management'
          }
        },
        {
          id: 'request-time-off',
          title: 'Request Time Off',
          description: 'Submit and manage your vacation and time-off requests.',
          data: {
            title: 'Request Time Off',
            description: 'Submit and manage your vacation and time-off requests.',
            tryItYourself: {
              scenario: 'Automate time-off requests and approval workflows.',
              actions: [
                'Submit requests automatically',
                'Get approval notifications',
                'Track time-off balances'
              ]
            },
            agents: [],
            learnMoreLink: 'Learn more about Time Off Management'
          }
        },
        {
          id: 'reset-password',
          title: 'Reset Password',
          description: 'Securely reset your passwords for various systems and applications.',
          data: {
            title: 'Reset Password',
            description: 'Securely reset your passwords for various systems and applications.',
            tryItYourself: {
              scenario: 'Automate password reset workflows and security procedures.',
              actions: [
                'Auto-reset passwords securely',
                'Get security notifications',
                'Streamline authentication'
              ]
            },
            agents: [],
            learnMoreLink: 'Learn more about Security Management'
          }
        }
      ]
    };
  }

  isWebhookConfigured(): boolean {
    return !!this.webhookUrl;
  }

  getConnectionInfo() {
    return {
      webhookUrl: this.webhookUrl || 'Not configured',
      isConfigured: this.isWebhookConfigured(),
      source: 'n8n automations webhook'
    };
  }
}

export const automationsService = new AutomationsService();
export type { AutomationsData, AutomationAgent, AutomationTool, AutomateTasksItem, AutomateTasksResponse };