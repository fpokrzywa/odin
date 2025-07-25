// Service for handling Find Answers data from n8n webhook
export interface AnswerArticle {
  id: string;
  title: string;
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
  tryItSection: {
    title: string;
    description: string;
    bulletPoints: string[];
  };
  articlesSection: {
    title: string;
    articles: AnswerArticle[];
  };
  learnMoreLink?: {
    text: string;
    url: string;
  };
}

export interface FindAnswersResponse {
  items: FindAnswersItem[];
}

class AnswersService {
  private webhookUrl: string | undefined;
  private cachedAnswers: FindAnswersResponse | null = null;
  private cacheTimestamp: number = 0;
  private cacheExpiryMs = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.webhookUrl = import.meta.env.VITE_N8N_ANSWERS_WEBHOOK_URL;
  }

  async getFindAnswersItems(forceRefresh: boolean = false): Promise<FindAnswersResponse> {
    // Check cache first unless force refresh is requested
    if (!forceRefresh && this.cachedAnswers && (Date.now() - this.cacheTimestamp) < this.cacheExpiryMs) {
      console.log('📋 AnswersService: Returning cached answers');
      return this.cachedAnswers;
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
        
        // Transform the webhook data to match our interface
        const findAnswersData = this.transformWebhookData(data);
        
        // Cache the results
        this.cachedAnswers = findAnswersData;
        this.cacheTimestamp = Date.now();
        
        console.log('✅ AnswersService: Successfully loaded answers from webhook');
        return findAnswersData;
      }
      
      // Fallback data when webhook is not configured
      console.log('⚠️ AnswersService: Webhook not configured, using fallback data');
      const fallbackData = this.getFallbackData();
      
      // Cache fallback data too
      this.cachedAnswers = fallbackData;
      this.cacheTimestamp = Date.now();
      
      return fallbackData;
    } catch (error) {
      console.error('❌ AnswersService: Error fetching from webhook:', error);
      console.log('⚠️ AnswersService: Falling back to static data');
      return this.getFallbackData();
    }
  }

  async getAnswersForItem(itemId: string): Promise<AnswersData | null> {
    const findAnswersData = await this.getFindAnswersItems();
    const item = findAnswersData.items.find(item => item.id === itemId);
    return item ? item.data : null;
  }

  private transformWebhookData(data: any): FindAnswersResponse {
    // Handle different response formats from n8n/webhook
    let rawData: any;
    
    if (Array.isArray(data)) {
      rawData = { items: data };
    } else if (data.items) {
      rawData = data;
    } else if (data.data) {
      rawData = data.data;
    } else {
      rawData = data;
    }

    // Transform items to our expected format
    const items = (rawData.items || []).map((item: any, index: number) => ({
      id: item.id || `item-${index}`,
      title: item.title || `Item ${index + 1}`,
      description: item.description || '',
      icon: item.icon,
      data: {
        title: item.data?.title || item.title || 'Knowledge articles',
        description: item.data?.description || item.description || 'Find relevant information across all business systems.',
        tryItSection: {
          title: item.data?.tryItSection?.title || 'Try it yourself!',
          description: item.data?.tryItSection?.description || 'Explore the available resources and get answers to your questions.',
          bulletPoints: item.data?.tryItSection?.bulletPoints || [
            'Ask questions about the policies',
            'Find information tailored to your needs'
          ]
        },
        articlesSection: {
          title: item.data?.articlesSection?.title || 'Here are the sample articles that power the answers about your questions',
          articles: (item.data?.articlesSection?.articles || item.data?.articles || []).map((article: any, articleIndex: number) => ({
            id: article.id || `article-${articleIndex}`,
            title: article.title || `Article ${articleIndex + 1}`,
            content: article.content || `Sample content for ${article.title?.toLowerCase() || 'this article'}...`,
            category: article.category,
            isExpanded: false
          }))
        },
        learnMoreLink: item.data?.learnMoreLink || {
          text: 'Learn more about Enterprise Search',
          url: '#'
        }
      }
    }));

    return { items };
  }

  private getFallbackData(): FindAnswersResponse {
    return {
      items: [
        {
          id: 'knowledge-articles',
          title: 'Knowledge articles',
          description: 'Find answers to your questions',
          data: {
            title: 'Knowledge articles',
            description: 'Moveworks quickly answers employee questions on any topic by finding relevant information across all the business systems.',
            tryItSection: {
              title: 'Try it yourself!',
              description: 'Imagine you are an employee at BannerTech. You are curious about company policies and benefits. Here\'s what you can do with Moveworks:',
              bulletPoints: [
                'Ask questions about the policies',
                'Find information tailored to your needs. e.g. Can I take a two-week vacation based on my PTO balance?'
              ]
            },
            articlesSection: {
              title: 'Here are the sample articles that power the answers about your questions',
              articles: [
                {
                  id: 'us-leave',
                  title: 'US Leave Policies',
                  content: 'Sample content for us leave policies...',
                  isExpanded: false
                },
                {
                  id: 'india-leave',
                  title: 'India Leave Policies',
                  content: 'Sample content for india leave policies...',
                  isExpanded: false
                },
                {
                  id: 'laptop-refresh',
                  title: 'BannerTech Laptop Refresh Policy',
                  content: 'Sample content for bannertech laptop refresh policy...',
                  isExpanded: false
                },
                {
                  id: 'troubleshooting-printers',
                  title: 'Troubleshooting Printers',
                  content: 'Sample content for troubleshooting printers...',
                  isExpanded: false
                },
                {
                  id: 'travel-expense',
                  title: 'Global Travel & Expense Policy',
                  content: 'Sample content for global travel & expense policy...',
                  isExpanded: false
                },
                {
                  id: 'workday-update',
                  title: 'How to Update Personal Information in Workday',
                  content: 'Sample content for how to update personal information in workday...',
                  isExpanded: false
                }
              ]
            },
            learnMoreLink: {
              text: 'Learn more about Enterprise Search',
              url: '#'
            }
          }
        },
        {
          id: 'organization-chart',
          title: 'Organization chart',
          description: 'View company organizational structure',
          data: {
            title: 'Organization Chart',
            description: 'View and navigate your company\'s organizational structure with ease.',
            tryItSection: {
              title: 'Coming Soon!',
              description: 'This feature is currently being developed.',
              bulletPoints: [
                'Intuitive interface for easy navigation',
                'Real-time updates and notifications'
              ]
            },
            articlesSection: {
              title: 'Related Resources',
              articles: []
            },
            learnMoreLink: {
              text: 'Learn more about Organization Management',
              url: '#'
            }
          }
        },
        {
          id: 'conference-rooms',
          title: 'Conference rooms',
          description: 'Find and book meeting rooms',
          data: {
            title: 'Conference Rooms',
            description: 'Find and book available conference rooms for your meetings.',
            tryItSection: {
              title: 'Coming Soon!',
              description: 'This feature is currently being developed.',
              bulletPoints: [
                'Real-time room availability',
                'Easy booking interface'
              ]
            },
            articlesSection: {
              title: 'Related Resources',
              articles: []
            },
            learnMoreLink: {
              text: 'Learn more about Room Booking',
              url: '#'
            }
          }
        },
        {
          id: 'customer-accounts',
          title: 'Customer accounts',
          description: 'Access customer information',
          data: {
            title: 'Customer Accounts',
            description: 'Access and manage customer account information and details.',
            tryItSection: {
              title: 'Coming Soon!',
              description: 'This feature is currently being developed.',
              bulletPoints: [
                'Comprehensive customer data',
                'Secure access controls'
              ]
            },
            articlesSection: {
              title: 'Related Resources',
              articles: []
            },
            learnMoreLink: {
              text: 'Learn more about Customer Management',
              url: '#'
            }
          }
        },
        {
          id: 'expense-reports',
          title: 'Expense reports',
          description: 'Submit and track expenses',
          data: {
            title: 'Expense Reports',
            description: 'Submit, track, and manage your expense reports efficiently.',
            tryItSection: {
              title: 'Coming Soon!',
              description: 'This feature is currently being developed.',
              bulletPoints: [
                'Easy expense submission',
                'Real-time tracking'
              ]
            },
            articlesSection: {
              title: 'Related Resources',
              articles: []
            },
            learnMoreLink: {
              text: 'Learn more about Expense Management',
              url: '#'
            }
          }
        }
      ]
      }
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