// Service for handling Find Answers data from n8n webhook
export interface AnswerArticle {
  id: string;
  title: string;
  content: string;
  category?: string;
  isExpanded?: boolean;
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

class AnswersService {
  private webhookUrl: string | undefined;
  private cachedAnswers: AnswersData | null = null;
  private cacheTimestamp: number = 0;
  private cacheExpiryMs = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.webhookUrl = import.meta.env.VITE_N8N_ANSWERS_WEBHOOK_URL;
  }

  async getAnswers(forceRefresh: boolean = false): Promise<AnswersData> {
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
        const answersData = this.transformWebhookData(data);
        
        // Cache the results
        this.cachedAnswers = answersData;
        this.cacheTimestamp = Date.now();
        
        console.log('✅ AnswersService: Successfully loaded answers from webhook');
        return answersData;
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

  private transformWebhookData(data: any): AnswersData {
    // Handle different response formats from n8n/webhook
    let answersData: any;
    
    if (Array.isArray(data)) {
      answersData = data[0] || {};
    } else if (data.answers) {
      answersData = data.answers;
    } else if (data.data) {
      answersData = data.data;
    } else {
      answersData = data;
    }

    // Transform to our expected format
    return {
      title: answersData.title || 'Knowledge articles',
      description: answersData.description || 'Moveworks quickly answers employee questions on any topic by finding relevant information across all the business systems.',
      tryItSection: {
        title: answersData.tryItSection?.title || 'Try it yourself!',
        description: answersData.tryItSection?.description || 'Imagine you are an employee at BannerTech. You are curious about company policies and benefits. Here\'s what you can do with Moveworks:',
        bulletPoints: answersData.tryItSection?.bulletPoints || [
          'Ask questions about the policies',
          'Find information tailored to your needs. e.g. Can I take a two-week vacation based on my PTO balance?'
        ]
      },
      articlesSection: {
        title: answersData.articlesSection?.title || 'Here are the sample articles that power the answers about your questions',
        articles: (answersData.articlesSection?.articles || answersData.articles || []).map((article: any, index: number) => ({
          id: article.id || `article-${index}`,
          title: article.title || `Article ${index + 1}`,
          content: article.content || `Sample content for ${article.title?.toLowerCase() || 'this article'}...`,
          category: article.category,
          isExpanded: false
        }))
      },
      learnMoreLink: answersData.learnMoreLink || {
        text: 'Learn more about Enterprise Search',
        url: '#'
      }
    };
  }

  private getFallbackData(): AnswersData {
    return {
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
export type { AnswersData, AnswerArticle };