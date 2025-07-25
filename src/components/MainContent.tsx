import React, { useState, useEffect } from 'react';
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
  const [debugInfo, setDebugInfo] = useState<string>('');

  const [availableAssistants, setAvailableAssistants] = useState<string[]>([]);
  const [openaiAssistants, setOpenaiAssistants] = useState<any[]>([]);

  // Load OpenAI assistants to get dynamic list
  useEffect(() => {
    const loadAssistants = async () => {
      try {
        const { openaiService } = await import('../services/openaiService');
        const result = await openaiService.listAssistants();
        console.log('MainContent: Loaded OpenAI assistants for @ mentions:', result.assistants);
        if (result.assistants.length > 0) {
          const convertedAssistants = result.assistants.map(assistant => 
            openaiService.convertToInternalFormat(assistant)
          );
          setOpenaiAssistants(convertedAssistants);
          // Only use OpenAI assistant names for @ mentions
          const assistantNames = convertedAssistants.map(assistant => assistant.name);
          setAvailableAssistants(assistantNames);
          console.log('MainContent: Set available assistants for @ mentions:', assistantNames);
        } else {
          console.log('MainContent: No OpenAI assistants found');
          setAvailableAssistants([]);
        }
      } catch (error) {
        console.error('MainContent: Error loading assistants for @ mentions:', error);
        // Clear assistants if loading fails
        setAvailableAssistants([]);
      }
    };

    loadAssistants();
  }, []);

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
    setDebugInfo(`Loading section: ${sectionId}`);
    
    try {
      console.log('🔄 MainContent: Loading answers data for section:', sectionId);
      
      // Get all items from webhook
      const allItems = await answersService.getFindAnswersItems(forceRefresh);
      console.log('📦 MainContent: All items loaded:', allItems.items.length);
      console.log('📦 MainContent: Raw items data:', allItems.items);
      setDebugInfo(`Loaded ${allItems.items.length} items from webhook`);
      
      // Log all available items for debugging
      console.log('📋 Available items:', allItems.items.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description
      })));
      
      // Try multiple matching strategies
      let matchedItem = null;
      
      // Strategy 1: Exact ID match
      matchedItem = allItems.items.find(item => item.id === sectionId);
      if (matchedItem) {
        console.log('✅ Found exact ID match:', matchedItem.id);
        console.log('✅ Matched item data structure:', matchedItem);
      }
      // Check if the message contains an @ mention
      // const atMentionMatch = inputValue.match(/@([^@\s]+(?:\s+[^@\s]+)*)\s*(.*)/);
      // if (atMentionMatch) {
      //   const mentionedAssistantName = atMentionMatch[1].trim();
      //   const messageText = atMentionMatch[2].trim();
        
      //   console.log('🎯 MainContent: Found @ mention:', { mentionedAssistantName, messageText, availableAssistants });
        
      //   // Check if the mentioned assistant exists in our OpenAI assistants
      //   if (availableAssistants.includes(mentionedAssistantName) && messageText) {
      //     console.log('✅ MainContent: Routing message to assistant:', mentionedAssistantName);
      //     setPendingAssistantMessage({ assistant: mentionedAssistantName, message: messageText });
      //     setInputValue('');
      //     return;
      //   } else if (!messageText) {
      //     console.log('⚠️ MainContent: No message text after @ mention');
      //     return; // Don't send if there's no message after the @ mention
      //   } else {
      //     console.log('⚠️ MainContent: Assistant not found in available list:', mentionedAssistantName);
      //   }
      // }
      
      
      setDebugInfo(`Looking for: ${sectionId}, Found: ${matchedItem ? matchedItem.title : 'None'}`);
      
      if (matchedItem) {
        console.log('🎯 MainContent: Setting answers data:', matchedItem.data);
        setAnswersData(matchedItem.data);
        setDebugInfo(`Successfully loaded: ${matchedItem.title}`);
        console.log('✅ MainContent: Successfully loaded data for section:', sectionId);
      } else {
        // Create fallback data if no match found
        const fallbackData: AnswersData = {
          title: `Content for ${sectionId}`,
          description: 'This content is being loaded from the webhook.',
          tryItYourself: {
            scenario: 'No specific scenario available',
            actions: ['Check back later for updated content']
          },
          articles: [],
          learnMoreLink: null
        };
        setAnswersData(fallbackData);
        setDebugInfo(`No match found, using fallback data`);
      }
      
      console.log('🔗 MainContent: Webhook connection info:', answersService.getConnectionInfo());
      console.log('💾 MainContent: Cache status:', answersService.getCacheStatus());
      
    } catch (error) {
      console.error('❌ MainContent: Error loading answers data for', sectionId, ':', error);
      setError(`Error loading content: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setDebugInfo(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !showAssistantDropdown) {
      e.preventDefault(); // Prevent form submission
      handleSend();
    }
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

    if (error) {
      return (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">{error}</p>
          <div className="text-sm text-gray-400 mb-4">
            <p>Section ID: {activeSection}</p>
            <p>Debug: {debugInfo}</p>
            <p>Webhook configured: {answersService.isWebhookConfigured() ? 'Yes' : 'No'}</p>
            <p>Connection: {JSON.stringify(answersService.getConnectionInfo())}</p>
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

    if (!answersData) {
      return (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">No data available for this section</p>
          <div className="text-sm text-gray-400 mb-4">
            <p>Section ID: {activeSection}</p>
            <p>Debug: {debugInfo}</p>
            <p>Webhook configured: {answersService.isWebhookConfigured() ? 'Yes' : 'No'}</p>
            <p>Connection: {JSON.stringify(answersService.getConnectionInfo())}</p>
          </div>
          <button
            onClick={() => loadAnswersData(activeSection, true)}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }

    console.log('🎨 MainContent: Rendering content with data:', answersData);

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
        {answersData.tryItYourself && (
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
        )}

        {/* Articles Section */}
        {answersData.articles && answersData.articles.length > 0 && (
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
        )}

        {/* Learn More Link */}
        {answersData.learnMoreLink && (
          <div className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 transition-colors cursor-pointer">
            <ArrowRight className="w-4 h-4" />
            <span className="font-medium">{answersData.learnMoreLink}</span>
          </div>
        )}

        {/* Debug Information */}
        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-sm text-gray-600">
          <p><strong>Debug Info:</strong> {debugInfo}</p>
          <p><strong>Section:</strong> {activeSection}</p>
          <p><strong>Has Data:</strong> {answersData ? 'Yes' : 'No'}</p>
          {answersData && (
            <>
              <p><strong>Title:</strong> {answersData.title}</p>
              <p><strong>Articles Count:</strong> {answersData.articles?.length || 0}</p>
              <p><strong>Try It Yourself:</strong> {answersData.tryItYourself ? 'Yes' : 'No'}</p>
            </>
          )}
        </div>
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
    // console.log('🚀 MainContent: Sending message to assistant:', assistantName, 'Message:', message);
    
    // // Find the OpenAI assistant by name
    // const openaiAssistant = openaiAssistants.find(assistant => assistant.name === assistantName);
    // const assistantId = openaiAssistant ? openaiAssistant.id : assistantName.toLowerCase().replace(/\s+/g, '_');
    
    // console.log('🔍 MainContent: Found assistant:', { assistantName, assistantId, openaiAssistant });
  };

  const getContentForSection = () => {
    // Check if this is a Find Answers section that should load from webhook
    const findAnswersSections = ['knowledge-articles', 'organization-chart', 'conference-rooms', 'customer-accounts', 'expense-reports'];
    
    // console.log('🆕 MainContent: Creating new thread for assistant:', assistantName);
    if (findAnswersSections.includes(activeSection)) {
      return renderKnowledgeArticles();
    } else {
      // console.log('🔄 MainContent: Using existing thread for assistant:', assistantName);
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
          // console.log('📤 MainContent: Sending message via streaming to thread:', targetThread.id);
          <div className="text-center py-16">
            <div className="text-gray-500">
              <p className="mb-4">Loading content for: {activeSection}</p>
              <button
                onClick={() => loadAnswersData(activeSection, true)}
                // console.log('✅ MainContent: Message sent successfully');
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                // console.error('❌ MainContent: Error sending message:', err);
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