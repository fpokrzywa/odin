// Service for handling Find Answers data from n8n webhook
export interface AnswerArticle {
  id: string;
  policyName: string;
  content: string;
  category?: string;
  isExpanded?: boolean;
}

export interface FindAnswersItem {
  id: string;
  title: string;
  description: string;
  icon?: string;
  data: AnswersData;
}

export interface AnswersData {
  title: string;
  description: string;
  tryItYourself: {
    scenario: string;
    actions: string[];
  };
  articles: AnswerArticle[];
  learnMoreLink?: string;
}

export interface FindAnswersResponse {
  items: FindAnswersItem[];
}

class AnswersService {
  private webhookUrl: string | undefined;
  private cachedItems: FindAnswersResponse | null = null;
  private cachedItemData: Map<string, AnswersData> = new Map();
  private cacheTimestamp: number = 0;
  private cacheExpiryMs = 10 * 60 * 1000; // 10 minutes for better performance

  constructor() {
    this.webhookUrl = import.meta.env.VITE_N8N_ANSWERS_WEBHOOK_URL;
  }

  async getFindAnswersItems(forceRefresh: boolean = false): Promise<FindAnswersResponse> {
    // Check cache first unless force refresh is requested
    if (!forceRefresh && this.cachedItems && (Date.now() - this.cacheTimestamp) < this.cacheExpiryMs) {
      console.log('📋 AnswersService: Returning cached answers');
      return this.cachedItems;
    }

    try {
      if (this.webhookUrl) {
        console.log('🔗 AnswersService: Fetching answers from n8n webhook:', this.webhookUrl);
        
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
        console.log('📦 AnswersService: Raw webhook response:', data);
        
        // Log the structure of the first item to understand the data format
        if (Array.isArray(data) && data.length > 0) {
          console.log('📋 AnswersService: First item structure:', data[0]);
        }
        
        // Transform the webhook data to match our interface
        const findAnswersData = this.transformWebhookData(data);
        console.log('🔄 AnswersService: Transformed data:', findAnswersData);
        
        // Cache the results
        this.cachedItems = findAnswersData;
        this.cacheTimestamp = Date.now();
        
        // Cache individual item data for faster access
        findAnswersData.items.forEach(item => {
          this.cachedItemData.set(item.id, item.data);
        });
        
        console.log('✅ AnswersService: Successfully loaded answers from webhook');
        return findAnswersData;
      }
      
      // Fallback data when webhook is not configured
      console.log('⚠️ AnswersService: Webhook not configured, using fallback data');
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
      console.error('❌ AnswersService: Error fetching from webhook:', error);
      console.log('⚠️ AnswersService: Falling back to static data');
      return this.getFallbackData();
    }
  }

  async getAnswersForItem(itemId: string): Promise<AnswersData | null> {
    // Check cache first for individual item data
    if (this.cachedItemData.has(itemId) && (Date.now() - this.cacheTimestamp) < this.cacheExpiryMs) {
      console.log('📋 AnswersService: Returning cached item data for', itemId);
      return this.cachedItemData.get(itemId) || null;
    }
    
    // If not in cache, load all items and cache them
    const findAnswersData = await this.getFindAnswersItems();
    const item = findAnswersData.items.find(item => item.id === itemId);
    
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
    console.log('🗑️ AnswersService: Cache cleared');
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

  private transformWebhookData(data: any): FindAnswersResponse {
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

    // Transform items to match our interface - handle the actual webhook structure from n8n
    const items = rawItems.map((item: any) => ({
      id: item.id || item._id || Math.random().toString(36).substr(2, 9),
      title: item.title || 'Untitled Item',
      description: item.description || '',
      icon: item.icon,
      data: {
        title: item.title || 'Knowledge articles',
        description: item.description || 'Find relevant information across all business systems.',
        tryItYourself: {
          scenario: item.tryItYourself?.scenario || item.scenario || `Explore ${item.title || 'this section'} to find helpful information and resources.`,
          actions: item.tryItYourself?.actions || item.actions || [
            `Ask ODIN questions about ${item.title?.toLowerCase() || 'this topic'}`,
            'Get instant answers and guidance',
            'Find relevant policies and procedures'
          ]
        },
        articles: item.articles && Array.isArray(item.articles) ? item.articles.map((article: any, articleIndex: number) => ({
          id: article.id || `article-${articleIndex}`,
          policyName: article.policyName || `Article ${articleIndex + 1}`,
          content: article.content || `Sample content for ${article.policyName?.toLowerCase() || 'this article'}...`,
          category: article.category,
          isExpanded: false
        })) : [
          // Generate sample articles based on the section type
          {
            id: `${item.id}-sample-1`,
            policyName: `${item.title} - Getting Started`,
            content: `This section contains helpful information about ${item.title?.toLowerCase() || 'this topic'}. Use ODIN to ask specific questions and get detailed answers.`,
            isExpanded: false
          },
          {
            id: `${item.id}-sample-2`, 
            policyName: `${item.title} - Best Practices`,
            content: `Learn about best practices and common procedures related to ${item.title?.toLowerCase() || 'this area'}. ODIN can provide more specific guidance based on your needs.`,
            isExpanded: false
          },
          {
            id: `${item.id}-sample-3`,
            policyName: `${item.title} - Troubleshooting`,
            content: `Find solutions to common issues and troubleshooting steps for ${item.title?.toLowerCase() || 'this topic'}. Ask ODIN for help with specific problems.`,
            isExpanded: false
          }
        ],
        learnMoreLink: item.learnMoreLink || `Contact: ${item.learnMoreLink}` || `Learn more about ${item.title}`
      }
    }));

    return { items };
  }

  private getFallbackData(): FindAnswersResponse {
    return {
      items: [
        {
          id: 'A1970-1',
          title: 'HR Policies',
          description: 'Our policies provide a comprehensive and accessible guide to the organization\'s official guidelines, procedures, and expectations for employees and management.',
          data: {
            title: 'HR Policies',
            description: 'Our policies provide a comprehensive and accessible guide to the organization\'s official guidelines, procedures, and expectations for employees and management.',
            tryItYourself: {
              scenario: 'Explore HR policies to find helpful information about company guidelines, procedures, and employee expectations.',
              actions: [
                'Ask ODIN questions about HR policies',
                'Get instant answers about company guidelines',
                'Find relevant procedures and expectations'
              ]
            },
            articles: [
              {
                id: 'hr-policy-1',
                policyName: 'Employee Handbook',
                content: 'Comprehensive guide covering all employee policies, procedures, and expectations...',
                isExpanded: false
              },
              {
                id: 'hr-policy-2',
                policyName: 'Code of Conduct',
                content: 'Guidelines for professional behavior and ethical standards...',
                isExpanded: false
              },
              {
                id: 'hr-policy-3',
                policyName: 'Benefits and Compensation',
                content: 'Information about employee benefits, compensation structure, and related policies...',
                isExpanded: false
              }
            ],
            learnMoreLink: 'Contact: HR_Contact@agenticweaver.com'
          }
        },
        {
          id: 'organization-chart',
          title: 'Organization chart',
          description: 'View company organizational structure',
          data: {
            title: 'Organization Chart',
            description: 'View and navigate your company\'s organizational structure with ease.',
            tryItYourself: {
              scenario: 'This feature is currently being developed.',
              actions: [
                'Intuitive interface for easy navigation',
                'Real-time updates and notifications'
              ]
            },
            articles: [],
            learnMoreLink: 'Learn more about Organization Management'
          }
        },
        {
          id: 'conference-rooms',
          title: 'Conference rooms',
          description: 'Find and book meeting rooms',
          data: {
            title: 'Conference Rooms',
            description: 'Find and book available conference rooms for your meetings.',
            tryItYourself: {
              scenario: 'This feature is currently being developed.',
              actions: [
                'Real-time room availability',
                'Easy booking interface'
              ]
            },
            articles: [],
            learnMoreLink: 'Learn more about Room Booking'
          }
        },
        {
          id: 'customer-accounts',
          title: 'Customer accounts',
          description: 'Access customer information',
          data: {
            title: 'Customer Accounts',
            description: 'Access and manage customer account information and details.',
            tryItYourself: {
              scenario: 'This feature is currently being developed.',
              actions: [
                'Comprehensive customer data',
                'Secure access controls'
              ]
            },
            articles: [],
            learnMoreLink: 'Learn more about Customer Management'
          }
        },
        {
          id: 'expense-reports',
          title: 'Expense reports',
          description: 'Submit and track expenses',
          data: {
            title: 'Expense Reports',
            description: 'Submit, track, and manage your expense reports efficiently.',
            tryItYourself: {
              scenario: 'This feature is currently being developed.',
              actions: [
                'Easy expense submission',
                'Real-time tracking'
              ]
            },
            articles: [],
            learnMoreLink: 'Learn more about Expense Management'
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
      source: 'n8n webhook'
    };
  }
}

export const answersService = new AnswersService();
export type { AnswersData, AnswerArticle, FindAnswersItem, FindAnswersResponse };