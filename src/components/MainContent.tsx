import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Sparkles, ArrowRight, Users, Video, CreditCard, Receipt, Download, Ticket, Mail, Calendar, Lock, RefreshCw } from 'lucide-react';
import { answersService, type AnswersData, type AnswerArticle } from '../services/answersService';

interface MainContentProps {
  activeSection: string;
}

const MainContent: React.FC<MainContentProps> = ({ activeSection }) => {
  const [expandedArticles, setExpandedArticles] = useState<string[]>([]);
  const [answersData, setAnswersData] = useState<AnswersData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load answers data when component mounts or when activeSection changes
  React.useEffect(() => {
    console.log('MainContent: activeSection changed to:', activeSection);
    // Load data for Find Answers sections
    if (activeSection) {
      console.log('MainContent: Loading data for Find Answers section:', activeSection);
      loadAnswersData(activeSection);
    }
  }, [activeSection]);

  const loadAnswersData = async (sectionId: string, forceRefresh: boolean = false) => {
    if (forceRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    
    try {
      console.log('🔄 MainContent: Loading answers data for section:', sectionId);
      
      // First try to get all items and find the one that matches
      const allItems = await answersService.getFindAnswersItems();
      console.log('📦 MainContent: All items loaded:', allItems.items.length);
      
      // Try to find the item by ID or title
      let matchedItem = allItems.items.find(item => 
        item.id === sectionId || 
        item.title.toLowerCase().replace(/\s+/g, '-') === sectionId ||
        item.title.toLowerCase().replace(/\s+/g, '_') === sectionId
      );
      
      // If not found by exact match, try partial matching
      if (!matchedItem) {
        matchedItem = allItems.items.find(item => 
          item.id.includes(sectionId) || 
          sectionId.includes(item.id) ||
          item.title.toLowerCase().includes(sectionId.toLowerCase())
        );
      }
      
      console.log('🔍 MainContent: Looking for section:', sectionId);
      console.log('🔍 MainContent: Available items:', allItems.items.map(item => ({ id: item.id, title: item.title })));
      console.log('🔍 MainContent: Matched item:', matchedItem);
      
      if (matchedItem) {
        setAnswersData(matchedItem.data);
        console.log('✅ MainContent: Successfully loaded data for section:', sectionId);
      } else {
        console.warn('⚠️ MainContent: No data found for section:', sectionId);
        setError(`No content found for section: ${sectionId}`);
        setAnswersData(data);
      }
      
      console.log('🔗 MainContent: Webhook connection info:', answersService.getConnectionInfo());
      console.log('💾 MainContent: Cache status:', answersService.getCacheStatus());
    } catch (error) {
      console.error('❌ MainContent: Error loading answers data for', sectionId, ':', error);
      setError(`Error loading content: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setAnswersData(null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    console.log('🔄 MainContent: Refresh button clicked - forcing data refresh from webhook');
    // Clear cache before refreshing
    answersService.clearCache();
    loadAnswersData(activeSection, true);
  };

  const toggleArticle = (article: string) => {
    setExpandedArticles(prev =>
      prev.includes(article)
        ? prev.filter(a => a !== article)
        : [...prev, article]
    );
  };

  const renderKnowledgeArticles = () => {
    if (isLoading) {
      return (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading knowledge articles...</p>
        </div>
      );
    }

    if (error || !answersData) {
      return (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">{error || 'Failed to load knowledge articles'}</p>
          <div className="text-sm text-gray-400 mb-4">
            <p>Section ID: {activeSection}</p>
            <p>Webhook configured: {answersService.isWebhookConfigured() ? 'Yes' : 'No'}</p>
          </div>
          <button
            onClick={() => loadAnswersData(activeSection, true)}
            className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }

    return (
      <>
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{answersData.title}</h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              {answersData.description}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 ml-4 ${
              isRefreshing ? 'cursor-not-allowed' : ''
            }`}
            title="Refresh knowledge articles"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm">Refresh</span>
          </button>
        </div>

        {/* Try it yourself section */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-3 mb-4">
            <Sparkles className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <h2 className="text-lg font-semibold text-orange-900">Try it yourself!</h2>
          </div>
          
          <div className="text-gray-700 mb-4">
            <p className="mb-4">{answersData.tryItYourself.scenario}</p>
            
            <ul className="space-y-2 ml-4">
              {answersData.tryItYourself.actions.map((action, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Articles Section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Here are the sample articles that power the answers about your questions
          </h3>
          
          <div className="space-y-3">
            {answersData.articles.map((article) => (
              <div key={article.id} className="bg-white border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleArticle(article.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">{article.policyName}</span>
                  {expandedArticles.includes(article.id) ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                
                {expandedArticles.includes(article.id) && (
                  <div className="px-4 pb-4 text-gray-600">
                    <div className="pt-2 border-t border-gray-100">
                      <p>{article.content}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Learn More Link */}
        {answersData.learnMoreLink && (
          <div className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 transition-colors cursor-pointer">
            <ArrowRight className="w-4 h-4" />
            <span className="font-medium">{answersData.learnMoreLink}</span>
          </div>
        )}
      </>
    );
  };

  const renderGenericContent = (title: string, description: string, icon: React.ElementType) => {
    const IconComponent = icon;
    
    return (
      <>
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <IconComponent className="w-8 h-8 text-orange-600" />
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          </div>
          <p className="text-gray-600 text-lg leading-relaxed">
            {description}
          </p>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-3 mb-4">
            <Sparkles className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <h2 className="text-lg font-semibold text-orange-900">Coming Soon!</h2>
          </div>
          
          <div className="text-gray-700">
            <p>
              This feature is currently being developed. Check back soon for updates and new functionality.
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">What you can expect:</h3>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start">
              <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span>Intuitive interface for easy navigation</span>
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span>Real-time updates and notifications</span>
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span>Seamless integration with existing systems</span>
            </li>
          </ul>
        </div>
      </>
    );
  };

  const getContentForSection = () => {
    // Check if this is a Find Answers section that should load from webhook
    const findAnswersSections = ['knowledge-articles', 'organization-chart', 'conference-rooms', 'customer-accounts', 'expense-reports'];
    
    if (findAnswersSections.includes(activeSection)) {
      return renderKnowledgeArticles();
    }
    
    // Handle other sections with static content
    switch (activeSection) {
      case 'software-apps':
        return renderGenericContent(
          'Get Software Apps',
          'Request and download approved software applications for your work.',
          Download
        );
      case 'support-tickets':
        return renderGenericContent(
          'Support Tickets',
          'Track and update your IT support tickets and requests.',
          Ticket
        );
      case 'email-groups':
        return renderGenericContent(
          'Email Groups',
          'Manage your email group memberships and distribution lists.',
          Mail
        );
      case 'time-off':
        return renderGenericContent(
          'Request Time Off',
          'Submit and manage your vacation and time-off requests.',
          Calendar
        );
      case 'reset-password':
        return renderGenericContent(
          'Reset Password',
          'Securely reset your passwords for various systems and applications.',
          Lock
        );
      default:
        return (
          <div className="text-center py-16">
            <div className="text-gray-500">
              <p className="mb-4">Loading content for: {activeSection}</p>
              <button
                onClick={() => loadAnswersData(activeSection, true)}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Retry Loading
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      <div className="max-w-4xl mx-auto p-8">
        {getContentForSection()}
      </div>
    </div>
  );
};

export default MainContent;