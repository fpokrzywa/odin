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
      console.log('📋 MongoService: Returning cached prompts (use forceRefresh=true to fetch from webhook)');
      return this.cachedPrompts;
    }

    try {
      // Try to fetch from n8n webhook first
      if (this.n8nConfig.isConfigured && this.n8nConfig.getWebhookUrl) {
        console.log('🔗 MongoService: Fetching prompts from n8n GET webhook:', this.n8nConfig.getWebhookUrl);
        
        try {
          const response = await fetch(this.n8nConfig.getWebhookUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error(`❌ MongoService: n8n webhook responded with status: ${response.status} - ${response.statusText}`);
          }

          const data = await response.json();
          console.log('📦 MongoService: Raw webhook response:', data);
          console.log('📦 Raw webhook response:', data);
          
          // Handle different response formats from n8n/MongoDB
          let prompts: MongoPrompt[];
          if (Array.isArray(data)) {
            // Direct array of prompts
            console.log('📋 MongoService: Processing direct array format');
            console.log('📋 Processing direct array format');
            prompts = data;
          } else if (data.prompts && Array.isArray(data.prompts)) {
            // Wrapped in prompts property
            console.log('📋 MongoService: Processing prompts property format');
            console.log('📋 Processing prompts property format');
            prompts = data.prompts;
          } else if (data.data && Array.isArray(data.data)) {
            // Wrapped in data property
            console.log('📋 MongoService: Processing data property format');
            console.log('📋 Processing data property format');
            prompts = data.data;
          } else if (data && typeof data === 'object') {
            // Check if it's a single prompt object or contains prompt data
            if (data.id && data.title && data.description && data.assistant) {
              // Single prompt object
              console.log('📋 MongoService: Processing single prompt object format');
              console.log('📋 Processing single prompt object format');
              prompts = [data];
            } else {
              // Try to find prompts in nested structure
              console.log('📋 MongoService: Searching for prompts in nested structure');
              console.log('📋 Searching for prompts in nested structure');
              const possibleArrays = Object.values(data).filter(Array.isArray);
              if (possibleArrays.length > 0) {
                console.log('📋 MongoService: Found array in nested structure:', possibleArrays[0].length, 'items');
                console.log('📋 Found array in nested structure:', possibleArrays[0].length, 'items');
                prompts = possibleArrays[0] as MongoPrompt[];
              } else {
                console.error('❌ MongoService: Response structure:', Object.keys(data));
                throw new Error('❌ MongoService: No valid prompt array found in response. Available keys: ' + Object.keys(data).join(', '));
                throw new Error('❌ No valid prompt array found in response. Available keys: ' + Object.keys(data).join(', '));
              }
            }
          } else {
            console.error('❌ MongoService: Invalid response type:', typeof data);
            throw new Error('❌ MongoService: Invalid response format from n8n webhook. Expected object or array, got: ' + typeof data);
            throw new Error('❌ Invalid response format from n8n webhook. Expected object or array, got: ' + typeof data);
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
          console.log(`✅ MongoService: Successfully loaded ${validatedPrompts.length} prompts from n8n webhook`);

          console.log(`✅ Successfully loaded ${validatedPrompts.length} prompts from n8n webhook`);
          
          // Cache the results
          this.cachedPrompts = validatedPrompts;
          this.cacheTimestamp = Date.now();
          return validatedPrompts;
        } catch (fetchError) {
          // Handle specific fetch errors
          if (fetchError instanceof TypeError && fetchError.message === 'Failed to fetch') {
            console.warn('🚫 MongoService: n8n webhook is not accessible. This could be due to:');
            console.warn('   1. MongoService: n8n server is not running');
            console.warn('   2. MongoService: Network connectivity issues');
            console.warn('   3. MongoService: CORS policy blocking the request');
            console.warn('   4. MongoService: Incorrect webhook URL:', this.n8nConfig.getWebhookUrl);
          } else {
            console.error('❌ MongoService: Error fetching from n8n webhook:', fetchError);
          }
          throw fetchError;
        }
      }
        
      // Return fallback data when MongoDB is not configured
      console.log('⚠️ MongoService: n8n webhook not configured, using fallback data');
      console.log('💡 MongoService: To use webhook, set these environment variables:');
      console.log('   - MongoService: VITE_N8N_GET_WEBHOOK_URL');
      console.log('   - MongoService: VITE_N8N_CREATE_WEBHOOK_URL');
      console.log('   - MongoService: VITE_N8N_UPDATE_WEBHOOK_URL');
      console.log('   - MongoService: VITE_N8N_DELETE_WEBHOOK_URL');
      console.log('💡 To use webhook, set these environment variables:');
      console.log('   - VITE_N8N_GET_WEBHOOK_URL');
      console.log('   - VITE_N8N_CREATE_WEBHOOK_URL');
      console.log('   - VITE_N8N_UPDATE_WEBHOOK_URL');
      console.log('   - VITE_N8N_DELETE_WEBHOOK_URL');
      
      // Cache fallback data too
      this.cachedPrompts = FALLBACK_PROMPTS;
      this.cacheTimestamp = Date.now();
      return FALLBACK_PROMPTS;
    } catch (error) {
      console.log('⚠️ MongoService: Falling back to static prompt data due to error:', error);
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