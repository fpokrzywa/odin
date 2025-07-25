interface OpenAIAssistant {
  id: string;
  name: string;
  description: string;
  instructions: string;
  model: string;
  tools: any[];
  created_at: number;
  metadata: Record<string, any>;
}

interface Assistant {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isFavorite?: boolean;
  model?: string;
  instructions?: string;
  isCustom?: boolean;
}

class OpenAIService {
  private apiKey: string | null = null;
  private baseURL = 'https://api.openai.com/v1';
  private cacheKey = 'openai_assistants_cache';
  private cacheTimestampKey = 'openai_assistants_cache_timestamp';
  private cacheExpiryMs = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // Try to get API key from environment first, then localStorage
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || localStorage.getItem('openai_api_key') || null;
  }

  // Cache management methods
  private getCachedAssistants(): OpenAIAssistant[] | null {
    try {
      const cached = localStorage.getItem(this.cacheKey);
      const timestamp = localStorage.getItem(this.cacheTimestampKey);
      
      if (!cached || !timestamp) {
        return null;
      }

      const cacheAge = Date.now() - parseInt(timestamp);
      if (cacheAge > this.cacheExpiryMs) {
        // Cache expired, remove it
        this.clearCache();
        return null;
      }

      return JSON.parse(cached);
    } catch (error) {
      console.warn('Error reading assistants cache:', error);
      this.clearCache();
      return null;
    }
  }

  private setCachedAssistants(assistants: OpenAIAssistant[]): void {
    try {
      localStorage.setItem(this.cacheKey, JSON.stringify(assistants));
      localStorage.setItem(this.cacheTimestampKey, Date.now().toString());
    } catch (error) {
      console.warn('Error saving assistants to cache:', error);
    }
  }

  private clearCache(): void {
    localStorage.removeItem(this.cacheKey);
    localStorage.removeItem(this.cacheTimestampKey);
  }

  // Check if cache is fresh (less than 1 minute old)
  private isCacheFresh(): boolean {
    const timestamp = localStorage.getItem(this.cacheTimestampKey);
    if (!timestamp) return false;
    
    const cacheAge = Date.now() - parseInt(timestamp);
    return cacheAge < 60 * 1000; // 1 minute
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    localStorage.setItem('openai_api_key', apiKey);
    // Clear cache when API key changes
    this.clearCache();
  }

  getApiKey(): string | null {
    // Always check environment first
    return import.meta.env.VITE_OPENAI_API_KEY || this.apiKey;
  }

  clearApiKey() {
    // Only clear localStorage key, not environment
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      this.apiKey = null;
      localStorage.removeItem('openai_api_key');
      // Clear cache when API key is removed
      this.clearCache();
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
      // Handle CORS and network errors specifically
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        // Don't throw error for CORS - this is expected behavior
        console.warn('OpenAI API not accessible from browser due to CORS policy. This is expected.');
        return {
          assistants: [],
          fromCache: false
        };
      }
      throw error;
    }
  }

  // Get cached assistants immediately, then optionally fetch fresh data
  getCachedAssistantsSync(): OpenAIAssistant[] {
    return this.getCachedAssistants() || [];
  }

  // Main method that returns cached data immediately and optionally fetches fresh data
  async listAssistants(forceRefresh: boolean = false): Promise<{
    assistants: OpenAIAssistant[];
    fromCache: boolean;
    hasUpdate?: boolean;
  }> {
    const cachedAssistants = this.getCachedAssistants();
    
    // If we have fresh cache and not forcing refresh, return cached data
    if (!forceRefresh && cachedAssistants && this.isCacheFresh()) {
      return {
        assistants: cachedAssistants,
        fromCache: true
      };
    }

    // If we have cache but it's not fresh, return cache first then fetch updates
    if (!forceRefresh && cachedAssistants) {
      // Return cached data immediately
      const result = {
        assistants: cachedAssistants,
        fromCache: true
      };

      // Fetch fresh data in background
      this.fetchFreshAssistants().catch(console.error);
      
      return result;
    }

    // No cache or forcing refresh - fetch fresh data
    try {
      return await this.fetchFreshAssistants();
    } catch (error) {
      console.error('Error fetching assistants:', error);
      throw error;
    }
  }

  private async fetchFreshAssistants(): Promise<{
    assistants: OpenAIAssistant[];
    fromCache: boolean;
    hasUpdate?: boolean;
  }> {
    const response = await this.makeRequest('/assistants?limit=100');
    const freshAssistants = response.data || [];
    
    // Cache the fresh data
    this.setCachedAssistants(freshAssistants);
    
    return {
      assistants: freshAssistants,
      fromCache: false
    };
  }

  async getAssistant(assistantId: string): Promise<OpenAIAssistant> {
    try {
      return await this.makeRequest(`/assistants/${assistantId}`);
    } catch (error) {
      console.error('Error fetching assistant:', error);
      throw error;
    }
  }

  // Convert OpenAI assistant to our internal format
  convertToInternalFormat(openaiAssistant: OpenAIAssistant): Assistant {
    // Import getCompanyBotName for comparison
    const getCompanyBotName = () => {
      try {
        const companyConfig = JSON.parse(localStorage.getItem('companyConfig') || '[]');
        return companyConfig[0]?.COMPANY_BOT_NAME || 'ODIN';
      } catch {
        return 'ODIN';
      }
    };
    
    // Generate icon and color based on assistant name or tools
    const { icon, color } = this.generateIconAndColor(openaiAssistant);

    // Special handling for ODIN assistant
    const isOdin = openaiAssistant.name === getCompanyBotName();
    
    return {
      id: openaiAssistant.id,
      name: openaiAssistant.name || 'Unnamed Assistant',
      description: openaiAssistant.description || openaiAssistant.instructions?.substring(0, 100) + '...' || 'No description available',
      icon: isOdin ? '/odin_icon_white.svg' : icon,
      color: isOdin ? 'bg-gray-800 text-white' : color,
      model: openaiAssistant.model,
      instructions: openaiAssistant.instructions,
      isFavorite: false
    };
  }

  private generateIconAndColor(assistant: OpenAIAssistant): { icon: string; color: string } {
    const colors = [
      'bg-blue-100 text-blue-600',
      'bg-green-100 text-green-600',
      'bg-purple-100 text-purple-600',
      'bg-yellow-100 text-yellow-600',
      'bg-red-100 text-red-600',
      'bg-indigo-100 text-indigo-600',
      'bg-pink-100 text-pink-600',
      'bg-teal-100 text-teal-600',
      'bg-orange-100 text-orange-600',
      'bg-cyan-100 text-cyan-600'
    ];

    // Generate icon based on tools or name
    let icon = '🤖'; // Default robot icon

    if (assistant.tools && assistant.tools.length > 0) {
      const toolTypes = assistant.tools.map(tool => tool.type);
      
      if (toolTypes.includes('code_interpreter')) {
        icon = '💻';
      } else if (toolTypes.includes('file_search')) {
        icon = '🔍';
      } else if (toolTypes.includes('function')) {
        icon = '⚡';
      }
    } else if (assistant.name) {
      // Generate icon based on name keywords
      const name = assistant.name.toLowerCase();
      if (name.includes('code') || name.includes('programming')) {
        icon = '💻';
      } else if (name.includes('write') || name.includes('content')) {
        icon = '✍️';
      } else if (name.includes('analyze') || name.includes('data')) {
        icon = '📊';
      } else if (name.includes('support') || name.includes('help')) {
        icon = '🔧';
      } else if (name.includes('creative') || name.includes('design')) {
        icon = '🎨';
      } else if (name.includes('research')) {
        icon = '🔬';
      } else if (name.includes('translate')) {
        icon = '🌐';
      } else if (name.includes('math') || name.includes('calculate')) {
        icon = '🧮';
      }
    }

    // Generate color based on assistant ID for consistency
    const colorIndex = assistant.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    const color = colors[colorIndex];

    return { icon, color };
  }

  // Test API connection
  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest('/models?limit=1');
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const openaiService = new OpenAIService();
export type { Assistant, OpenAIAssistant };