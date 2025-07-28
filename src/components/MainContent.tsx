import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Sparkles, ArrowRight, Users, Video, CreditCard, Receipt, Download, Ticket, Mail, Calendar, Lock, RefreshCw } from 'lucide-react';
import { answersService, type AnswersData, type AnswerArticle } from '../services/answersService';
import { automationsService, type AutomationsData, type AutomationAgent } from '../services/automationsService';

interface MainContentProps {
  activeSection: string;
  onAssistantChange?: (assistantId: string, assistantName: string) => void;
}

const MainContent: React.FC<MainContentProps> = ({ activeSection }) => {
  const [expandedArticles, setExpandedArticles] = useState<string[]>([]);
  const [answersData, setAnswersData] = useState<AnswersData | null>(null);
  const [automationsData, setAutomationsData] = useState<AutomationsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  // Load answers data when component mounts or when activeSection changes
  React.useEffect(() => {
    console.log('MainContent: activeSection changed to:', activeSection);
    // Load data for Find Answers and Automate Tasks sections
    if (activeSection) {
      console.log('MainContent: Loading data for section:', activeSection);
      loadSectionData(activeSection);
    }
  }, [activeSection]);

  const loadSectionData = async (sectionId: string, forceRefresh: boolean = false) => {
    if (forceRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    setDebugInfo(`Loading section: ${sectionId}`);
    
    try {
      // First try to load as Automate Tasks data
      console.log('🔄 MainContent: Trying to load as Automate Tasks section:', sectionId);
      const automationsResponse = await automationsService.getAutomateTasksItems(forceRefresh);
      console.log('📦 MainContent: Automate Tasks items loaded:', automationsResponse.items.length);
      
      const automationItem = automationsResponse.items.find(item => item.id === sectionId);
      if (automationItem) {
        console.log('✅ MainContent: Found Automate Tasks match:', automationItem.id);
        setAutomationsData(automationItem.data);
        setAnswersData(null); // Clear answers data
        setDebugInfo(`Successfully loaded Automate Tasks: ${automationItem.title}`);
        console.log('✅ MainContent: Successfully loaded Automate Tasks data for section:', sectionId);
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }
    } catch (error) {
      console.log('⚠️ MainContent: Not an Automate Tasks section, trying Find Answers:', error);
    }

    // If not found in Automate Tasks, try Find Answers
    await loadAnswersData(sectionId, forceRefresh);
  };

  const loadAnswersData = async (sectionId: string, forceRefresh: boolean = false) => {
    if (forceRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    setDebugInfo(`Loading Find Answers section: ${sectionId}`);
    
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
        console.log('✅ Matched item title:', matchedItem.title);
        console.log('✅ Matched item description:', matchedItem.description);
      }
      
      
      setDebugInfo(`Looking for: ${sectionId}, Found: ${matchedItem ? matchedItem.title : 'None'}`);
      
      if (matchedItem) {
        console.log('🎯 MainContent: Setting answers data:', matchedItem.data);
        setAnswersData(matchedItem.data);
        setAutomationsData(null); // Clear automations data
        setDebugInfo(`Successfully loaded: ${matchedItem.title}`);
        console.log('✅ MainContent: Successfully loaded data for section:', sectionId);
      } else {
        console.log('❌ MainContent: No match found for section ID:', sectionId);
        console.log('📋 MainContent: Available item IDs:', allItems.items.map(item => item.id));
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
        setAutomationsData(null); // Clear automations data
        setDebugInfo(`No match found, using fallback data`);
      }
      
      console.log('🔗 MainContent: Webhook connection info:', answersService.getConnectionInfo());
      console.log('💾 MainContent: Cache status:', answersService.getCacheStatus());
      
    } catch (error) {
      console.error('❌ MainContent: Error loading answers data for', sectionId, ':', error);
      setError(`Error loading content: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setDebugInfo(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setAnswersData(null);
      setAutomationsData(null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    console.log('🔄 MainContent: Refresh button clicked - forcing data refresh from webhook');
    // Clear cache before refreshing
    answersService.clearCache();
    automationsService.clearCache();
    loadSectionData(activeSection, true);
  };

  const toggleArticle = (article: string) => {
    setExpandedArticles(prev =>
      prev.includes(article)
        ? prev.filter(a => a !== article)
        : [...prev, article]
    );
  };

  const toggleAgent = (agent: string) => {
    setExpandedArticles(prev =>
      prev.includes(agent)
        ? prev.filter(a => a !== agent)
        : [...prev, agent]
    );
  };

  const renderKnowledgeArticles = () => {
    console.log('🎨 MainContent: renderKnowledgeArticles called with:', {
      isLoading,
      error,
      answersData: !!answersData,
      activeSection
    });

    if (isLoading) {
      console.log('🔄 MainContent: Showing loading state');
      return (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading knowledge articles...</p>
        </div>
      );
    }

    if (error) {
      console.log('❌ MainContent: Showing error state:', error);
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
            onClick={() => loadSectionData(activeSection, true)}
            className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }

    if (!answersData) {
      console.log('❌ MainContent: No answers data available');
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
            onClick={() => loadSectionData(activeSection, true)}
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
                        <p className="mb-3">{article.content}</p>
                        {/* Article metadata */}
                        <div className="flex flex-wrap gap-4 text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
                          {article.category && (
                            <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                              {article.category}
                            </span>
                          )}
                          {article.author && (
                            <span>Author: {article.author}</span>
                          )}
                          {article.lastUpdated && (
                            <span>Updated: {new Date(article.lastUpdated).toLocaleDateString()}</span>
                          )}
                          {article.url && (
                            <a 
                              href={article.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-orange-600 hover:text-orange-700 underline"
                            >
                              View Full Article
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Articles Message for Type 2 */}
        {answersData.articles && answersData.articles.length === 0 && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm">ℹ️</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Contact for More Information</h3>
                <p className="text-blue-800">
                  For detailed information and support, please reach out directly using the contact information below.
                </p>
              </div>
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
          <p><strong>Assistant ID:</strong> {answersData?.assistantID || 'None (will use ODIN)'}</p>
          <p><strong>Has Data:</strong> {answersData ? 'Yes' : 'No'}</p>
          {answersData && (
            <>
              <p><strong>Title:</strong> {answersData.title}</p>
              <p><strong>Articles Count:</strong> {answersData.articles?.length || 0}</p>
              <p><strong>Try It Yourself:</strong> {answersData.tryItYourself ? 'Yes' : 'No'}</p>
              <p><strong>Assistant ID from Data:</strong> {answersData.assistantID || 'Not specified'}</p>
            </>
          )}
        </div>
      </>
    );
  };

  const renderAutomateTasksContent = () => {
    console.log('🎨 MainContent: renderAutomateTasksContent called with:', {
      isLoading,
      error,
      automationsData: !!automationsData,
      activeSection
    });

    if (isLoading) {
      console.log('🔄 MainContent: Showing loading state for automations');
      return (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading automation tasks...</p>
        </div>
      );
    }

    if (error) {
      console.log('❌ MainContent: Showing error state for automations:', error);
      return (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">{error}</p>
          <div className="text-sm text-gray-400 mb-4">
            <p>Section ID: {activeSection}</p>
            <p>Debug: {debugInfo}</p>
            <p>Webhook configured: {automationsService.isWebhookConfigured() ? 'Yes' : 'No'}</p>
            <p>Connection: {JSON.stringify(automationsService.getConnectionInfo())}</p>
          </div>
          <button
            onClick={() => loadSectionData(activeSection, true)}
            className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }

    if (!automationsData) {
      console.log('❌ MainContent: No automations data available');
      return (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">No data available for this automation</p>
          <div className="text-sm text-gray-400 mb-4">
            <p>Section ID: {activeSection}</p>
            <p>Debug: {debugInfo}</p>
            <p>Webhook configured: {automationsService.isWebhookConfigured() ? 'Yes' : 'No'}</p>
            <p>Connection: {JSON.stringify(automationsService.getConnectionInfo())}</p>
          </div>
          <button
            onClick={() => loadSectionData(activeSection, true)}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }

    console.log('🎨 MainContent: Rendering automations content with data:', automationsData);

    return (
      <>
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{automationsData.title}</h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              {automationsData.description}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 ml-4 ${
              isRefreshing ? 'cursor-not-allowed' : ''
            }`}
            title="Refresh automation tasks"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm">Refresh</span>
          </button>
        </div>

        {/* Try it yourself section */}
        {automationsData.tryItYourself && (
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-6 mb-8">
            <div className="flex items-start space-x-3 mb-4">
              <Sparkles className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <h2 className="text-lg font-semibold text-orange-900">Try it yourself!</h2>
            </div>
            
            <div className="text-gray-700 mb-4">
              <p className="mb-4">{automationsData.tryItYourself.scenario}</p>
              
              <ul className="space-y-2 ml-4">
                {automationsData.tryItYourself.actions.map((action, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Agents Section */}
        {automationsData.agents && automationsData.agents.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Available Automation Agents
            </h3>
            
            <div className="space-y-3">
              {automationsData.agents.map((agent) => (
                <div key={agent.id} className="bg-white border border-gray-200 rounded-lg">
                  <button
                    onClick={() => toggleAgent(agent.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-gray-900">{agent.agentName}</span>
                        {agent.category && (
                          <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {agent.category}
                          </span>
                        )}
                      </div>
                      {agent.agentID && (
                        <p className="text-xs text-gray-500 mt-1">Agent ID: {agent.agentID}</p>
                      )}
                    </div>
                    {expandedArticles.includes(agent.id) ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  
                  {expandedArticles.includes(agent.id) && (
                    <div className="px-4 pb-4 text-gray-600">
                      <div className="pt-2 border-t border-gray-100">
                        <p className="mb-3">{agent.content}</p>
                        
                        {/* Tools Section */}
                        {agent.tools && agent.tools.length > 0 && (
                          <div className="mb-3">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Available Tools:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {agent.tools.map((tool) => (
                                <div key={tool.id} className="bg-gray-50 rounded-lg p-3">
                                  <div className="font-medium text-gray-900 text-sm">{tool.toolName}</div>
                                  <div className="text-xs text-gray-600 mt-1">{tool.description}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Agent metadata */}
                        <div className="flex flex-wrap gap-4 text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
                          {agent.author && (
                            <span>Author: {agent.author}</span>
                          )}
                          {agent.lastUpdated && (
                            <span>Updated: {new Date(agent.lastUpdated).toLocaleDateString()}</span>
                          )}
                          {agent.url && (
                            <a 
                              href={agent.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-orange-600 hover:text-orange-700 underline"
                            >
                              View Details
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Agents Message */}
        {automationsData.agents && automationsData.agents.length === 0 && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm">ℹ️</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Contact for More Information</h3>
                <p className="text-blue-800">
                  For detailed automation setup and support, please reach out directly using the contact information below.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Learn More Link */}
        {automationsData.learnMoreLink && (
          <div className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 transition-colors cursor-pointer">
            <ArrowRight className="w-4 h-4" />
            <span className="font-medium">{automationsData.learnMoreLink}</span>
          </div>
        )}

        {/* Debug Information */}
        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-sm text-gray-600">
          <p><strong>Debug Info:</strong> {debugInfo}</p>
          <p><strong>Section:</strong> {activeSection}</p>
          <p><strong>Data Type:</strong> Automate Tasks</p>
          <p><strong>Webhook URL:</strong> {automationsService.getConnectionInfo().webhookUrl}</p>
          <p><strong>Webhook Configured:</strong> {automationsService.isWebhookConfigured() ? 'Yes' : 'No'}</p>
          <p><strong>Has Data:</strong> {automationsData ? 'Yes' : 'No'}</p>
          {automationsData && (
            <>
              <p><strong>Title:</strong> {automationsData.title}</p>
              <p><strong>Agents Count:</strong> {automationsData.agents?.length || 0}</p>
              <p><strong>Try It Yourself:</strong> {automationsData.tryItYourself ? 'Yes' : 'No'}</p>
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
    // Check if this is an Automate Tasks section first
    const hasAutomationsData = !!automationsData;
    const isLoadingAutomationsData = isLoading && !answersData;
    
    if (hasAutomationsData || isLoadingAutomationsData) {
      console.log('✅ MainContent: Rendering automate tasks content for section:', activeSection);
      return renderAutomateTasksContent();
    }
    
    // Then check if this is a Find Answers section
    const hasAnswersData = !!answersData;
    const isLoadingAnswersData = isLoading && !automationsData;
    
    console.log('🔍 MainContent: Checking section type:', {
      activeSection,
      hasAutomationsData,
      hasAnswersData,
      isLoadingAnswersData,
      answersDataTitle: answersData?.title
    });
    
    // If we have answers data or are currently loading it, treat as Find Answers section
    if (hasAnswersData || isLoadingAnswersData) {
      console.log('✅ MainContent: Rendering knowledge articles for section:', activeSection);
      return renderKnowledgeArticles();
    }
    
    console.log('❌ MainContent: No answers data found, checking for static sections:', activeSection);
    
    // Handle other sections with static content
    switch (activeSection) {
      case 'get-software-apps':
        return renderGenericContent(
          'Get Software Apps',
          'Request and download approved software applications for your work.',
          Download
        );
      case 'track-support-tickets':
        return renderGenericContent(
          'Support Tickets',
          'Track and update your IT support tickets and requests.',
          Headphones
        );
      case 'manage-email-groups':
        return renderGenericContent(
          'Email Groups',
          'Manage your email group memberships and distribution lists.',
          Mail
        );
      case 'request-time-off':
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
        console.log('❓ MainContent: Unknown section, showing default content:', activeSection);
        return (
          <div className="text-center py-16">
            <div className="text-gray-500">
              <p className="mb-4">Loading content for: {activeSection}</p>
              <button
                onClick={() => loadSectionData(activeSection, true)}
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