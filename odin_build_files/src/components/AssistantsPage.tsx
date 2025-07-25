import React, { useState, useEffect } from 'react';
import { Search, Heart, ChevronDown, Settings, RefreshCw, AlertCircle, ExternalLink, Key } from 'lucide-react';
import { openaiService, type Assistant } from '../services/openaiService';
import OpenAISetup from './OpenAISetup';
import { getCompanyBotName } from '../utils/companyConfig';

interface AssistantsPageProps {
  onAssistantSelect: (assistant: { name: string; id: string }) => void;
}

const AssistantsPage: React.FC<AssistantsPageProps> = ({ onAssistantSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Sort');
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOpenAISetup, setShowOpenAISetup] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isLoadingFresh, setIsLoadingFresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);


  // Check for API key on component mount
  useEffect(() => {
    const apiKey = openaiService.getApiKey();
    setHasApiKey(!!apiKey);
    
    // If API key exists, load OpenAI assistants
    if (apiKey) {
      // First load cached assistants immediately
      const cachedAssistants = openaiService.getCachedAssistantsSync();
      if (cachedAssistants.length > 0) {
        const convertedAssistants = cachedAssistants.map(assistant => 
          openaiService.convertToInternalFormat(assistant)
        );
        setAssistants(convertedAssistants);
        setLastUpdated(new Date());
      }
      
      // Then load fresh data
      loadOpenAIAssistants();
    } else {
      // Clear assistants if no API key
      setAssistants([]);
      setLastUpdated(null);
    }
  }, []);

  const loadOpenAIAssistants = async (forceRefresh: boolean = false) => {
    setIsLoading(true);
    setIsLoadingFresh(forceRefresh);
    setError(null);

    try {
      const result = await openaiService.listAssistants(forceRefresh);
      const convertedAssistants = result.assistants.map(assistant => 
        openaiService.convertToInternalFormat(assistant)
      );

      setAssistants(convertedAssistants);
      setLastUpdated(new Date());
      
      if (!result.fromCache) {
        // Show a subtle notification that data was refreshed
        console.log('Assistants updated from OpenAI API');
      }
    } catch (err) {
      console.error('Error loading OpenAI assistants:', err);
      // Handle CORS errors gracefully - this is expected when calling OpenAI API directly from browser
      if (err instanceof Error && err.message.includes('CORS')) {
        setError('Cannot load custom assistants due to browser security limitations. This is normal when using OpenAI API directly from the browser.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load OpenAI assistants');
      }
    } finally {
      setIsLoading(false);
      setIsLoadingFresh(false);
    }
  };

  const handleRefresh = () => {
    loadOpenAIAssistants(true);
  };

  const handleApiKeySet = (apiKey: string) => {
    if (apiKey) {
      openaiService.setApiKey(apiKey);
      setHasApiKey(true);
      loadOpenAIAssistants();
    } else {
      openaiService.clearApiKey();
      setHasApiKey(false);
      setAssistants([]);
      setLastUpdated(null);
    }
  };

  const toggleFavorite = (assistantId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setAssistants(prevAssistants =>
      prevAssistants.map(assistant =>
        assistant.id === assistantId
          ? { ...assistant, isFavorite: !assistant.isFavorite }
          : assistant
      )
    );
  };

  const getSortedAssistants = (assistantsList: Assistant[]) => {
    // Always put ODIN first, regardless of sort order
    const odinAssistant = assistantsList.find(assistant => 
      assistant.name === getCompanyBotName()
    );
    const otherAssistants = assistantsList.filter(assistant => 
      assistant.name !== getCompanyBotName()
    );
    
    switch (sortBy) {
      case 'Name A-Z':
        const sortedAZ = [...otherAssistants].sort((a, b) => a.name.localeCompare(b.name));
        return odinAssistant ? [odinAssistant, ...sortedAZ] : sortedAZ;
      case 'Name Z-A':
        const sortedZA = [...otherAssistants].sort((a, b) => b.name.localeCompare(a.name));
        return odinAssistant ? [odinAssistant, ...sortedZA] : sortedZA;
      case 'Recently Added':
        const reversed = [...otherAssistants].reverse();
        return odinAssistant ? [odinAssistant, ...reversed] : reversed;
      case 'Favorites':
        const favorites = [...otherAssistants].filter(assistant => assistant.isFavorite);
        const odinIsFavorite = odinAssistant?.isFavorite;
        return odinIsFavorite ? [odinAssistant, ...favorites] : favorites;
      default:
        return odinAssistant ? [odinAssistant, ...otherAssistants] : otherAssistants;
    }
  };

  const filteredAndSortedAssistants = getSortedAssistants(
    assistants.filter(assistant =>
      assistant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assistant.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const showNoFavoritesMessage = sortBy === 'Favorites' && filteredAndSortedAssistants.length === 0 && searchQuery === '';

  return (
    <div className="flex-1 bg-gray-50 overflow-y-auto">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800 mb-2">
                Welcome to the AI Storefront
              </h1>
              <p className="text-gray-600">
                Each Assistant is created to help you do a specific set of tasks. Get answers to your questions, brainstorm ideas, create new content, and more!
              </p>
            </div>
            
            {/* OpenAI Integration Status */}
            <div className="flex items-center space-x-3">
              {hasApiKey && (
                <button
                  onClick={handleRefresh}
                  disabled={isLoadingFresh}
                  className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingFresh ? 'animate-spin' : ''}`} />
                  <span className="text-sm">Refresh</span>
                </button>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-amber-800 mb-1">Cannot Load Custom Assistants</h3>
                <p className="text-sm text-amber-700 mb-2">{error}</p>
                {error.includes('CORS') && (
                  <div className="text-sm text-amber-700">
                    <p className="mb-2">This is a browser security limitation. To use your OpenAI assistants:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Use the OpenAI website directly for custom assistants</li>
                      <li>Set up a backend server to proxy OpenAI API requests</li>
                      <li>Use our default assistants which work without API calls</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Info Banner for non-connected users */}
          {!hasApiKey && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-blue-800 mb-1">OpenAI API Key Required</h3>
                  <p className="text-sm text-blue-700 mb-2">
                    Please connect your OpenAI account to load and use your assistants.
                  </p>
                  <button
                    onClick={() => setShowOpenAISetup(true)}
                    className="inline-flex items-center space-x-1 text-sm text-orange-600 hover:text-orange-700 font-medium"
                  >
                    <span>Connect Now</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center space-x-4 mb-8">
          <div className="relative">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option>Sort</option>
              <option>Name A-Z</option>
              <option>Name Z-A</option>
              <option>Recently Added</option>
              <option>Favorites</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          
          <div className="flex-1 relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search using assistant name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          
          <span className="text-sm text-gray-500">
            {filteredAndSortedAssistants.length} assistant{filteredAndSortedAssistants.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
              <span className="text-gray-600">{assistants.length > 0 ? 'Refreshing assistants...' : 'Loading your OpenAI assistants...'}</span>
            </div>
          </div>
        )}

        {/* Assistants Grid */}
        {!isLoading && assistants.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedAssistants.map((assistant) => (
              <div
                key={assistant.id}
                onClick={() => onAssistantSelect({ name: assistant.name, id: assistant.id })}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer group relative"
              >

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className={`w-8 h-8 rounded flex items-center justify-center ${assistant.color} flex-shrink-0`}>
                      {assistant.icon.startsWith('/') ? (
                        <img 
                          src={assistant.icon} 
                          alt={assistant.name} 
                          className="w-6 h-6"
                        />
                      ) : (
                        <span className="text-lg">{assistant.icon}</span>
                      )}
                    </div>
                    <h3 className="font-medium text-gray-900 group-hover:text-orange-600 transition-colors truncate">
                      {assistant.name}
                    </h3>
                  </div>
                  <button 
                    onClick={(e) => toggleFavorite(assistant.id, e)}
                    className={`transition-colors flex-shrink-0 ml-2 ${
                      assistant.isFavorite 
                        ? 'text-orange-500 hover:text-orange-600' 
                        : 'text-gray-300 hover:text-orange-500'
                    }`}
                  >
                    <Heart 
                      className={`w-5 h-5 ${assistant.isFavorite ? 'fill-current' : ''}`} 
                    />
                  </button>
                </div>
                
                <p className="text-sm text-gray-600 leading-relaxed mb-3">
                  {assistant.description}
                </p>

                {/* Model info */}
                {assistant.model && (
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span className="px-2 py-1 bg-gray-100 rounded-full">
                      {assistant.model}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {/* No API Key State */}
        {!isLoading && !hasApiKey && (
          <div className="text-center py-16">
            <Key className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">OpenAI API Key Required</h3>
            <p className="text-gray-500 mb-6">Connect your OpenAI account to load your assistants</p>
            <button
              onClick={() => setShowOpenAISetup(true)}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Connect OpenAI Account
            </button>
          </div>
        )}

        {/* No Assistants State */}
        {!isLoading && hasApiKey && assistants.length === 0 && !error && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Assistants Found</h3>
            <p className="text-gray-500 mb-6">
              You don't have any assistants in your OpenAI account yet.
            </p>
            <a
              href="https://platform.openai.com/assistants"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <span>Create Assistant on OpenAI</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* Empty States */}
        {!isLoading && showNoFavoritesMessage && (
          <div className="text-center py-12">
            <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No favorite assistants yet</h3>
            <p className="text-gray-500">Click the heart icon on any assistant to add it to your favorites</p>
          </div>
        )}

        {!isLoading && filteredAndSortedAssistants.length === 0 && !showNoFavoritesMessage && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assistants found</h3>
            <p className="text-gray-500">
              {sortBy === 'Favorites' 
                ? 'No favorite assistants match your search' 
                : 'Try adjusting your search terms'
              }
            </p>
          </div>
        )}
      </div>

      {/* OpenAI Setup Modal */}
      <OpenAISetup
        isOpen={showOpenAISetup}
        onClose={() => setShowOpenAISetup(false)}
        onApiKeySet={handleApiKeySet}
        currentApiKey={openaiService.getApiKey()}
      />
    </div>
  );
};

export default AssistantsPage;