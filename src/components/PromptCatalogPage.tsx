import React, { useState } from 'react';
import { Search, Heart, ChevronDown, X, RefreshCw, Edit3, Trash2 } from 'lucide-react';
import { getCompanyName } from '../utils/companyConfig';
import { getCompanyBotName } from '../utils/companyConfig';

interface Prompt {
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

interface PromptCatalogPageProps {
  onPromptSelect: (promptText: string, assistantName: string) => void;
}

const PromptCatalogPage: React.FC<PromptCatalogPageProps> = ({ onPromptSelect }) => {
  const [activeTab, setActiveTab] = useState<'enterprise' | 'your'>('enterprise');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssistant, setSelectedAssistant] = useState('All Assistants');
  const [selectedTask, setSelectedTask] = useState('Select Task...');
  const [selectedFunctionalArea, setSelectedFunctionalArea] = useState('Select Functional Area...');
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Load prompts from fallback data when component mounts
  React.useEffect(() => {
    loadPrompts();
    loadUserProfile();
  }, []);

  const loadUserProfile = () => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }
  };

  const loadPrompts = async (forceRefresh: boolean = false) => {
    if (forceRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    
    try {
      // Use fallback prompts data
      const fallbackPrompts: Prompt[] = [
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
      
      setPrompts(fallbackPrompts);
    } catch (error) {
      console.error('Error loading prompts:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    console.log('Refresh button clicked - forcing data refresh');
    loadPrompts(true);
  };

  // Default assistants as fallback
  const defaultAssistants = [
    getCompanyBotName(),
    'IT Support',
    'HR Support',
    'Advance Policies Assistant',
    'Redact Assistant',
    'ADEPT Assistant',
    'RFP Assistant',
    'Resume Assistant'
  ];

  const availableAssistants = defaultAssistants;

  // Filter prompts based on active tab
  const getFilteredPrompts = () => {
    let basePrompts = prompts;
    
    // Filter by tab
    if (activeTab === 'your') {
      // Show only prompts owned by the current user
      basePrompts = prompts.filter(prompt => 
        prompt.owner && userProfile?.name && prompt.owner === userProfile.name
      );
    }
    
    // Apply search and filter criteria
    return basePrompts.filter(prompt => {
      const matchesSearch = prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           prompt.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesAssistant = selectedAssistant === 'All Assistants' || prompt.assistant === selectedAssistant;
      const matchesTask = selectedTask === 'Select Task...' || prompt.task === selectedTask;
      const matchesFunctionalArea = selectedFunctionalArea === 'Select Functional Area...' || 
                                   prompt.functionalArea === selectedFunctionalArea;
      
      return matchesSearch && matchesAssistant && matchesTask && matchesFunctionalArea;
    });
  };

  const filteredPrompts = getFilteredPrompts();

  // Get user's prompts count for display
  const userPromptsCount = prompts.filter(prompt => 
    prompt.owner && userProfile?.name && prompt.owner === userProfile.name
  ).length;

  const handlePromptClick = (prompt: Prompt) => {
    // Use the user field data if available, otherwise fall back to description
    const promptText = prompt.user || prompt.description;
    onPromptSelect(promptText, prompt.assistant);
  };

  return (
    <div className="flex-1 bg-gray-50 overflow-y-auto">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">
            Prompt Catalog
          </h1>
          <p className="text-gray-600">
            Discover and use pre-built prompts to get the most out of your AI assistants. Browse by category, assistant, or search for specific use cases.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="flex items-center justify-between border-b border-gray-200 mb-6">
          <div className="flex">
            <button
              onClick={() => setActiveTab('enterprise')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'enterprise'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {getCompanyName()} Common Prompts
            </button>
            <button
              onClick={() => setActiveTab('your')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'your'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Your Prompts {userPromptsCount > 0 && `(${userPromptsCount})`}
            </button>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${
              isRefreshing ? 'text-gray-400' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Assistant</label>
              <div className="relative">
                <select
                  value={selectedAssistant}
                  onChange={(e) => setSelectedAssistant(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option>All Assistants</option>
                  {availableAssistants.map((assistant) => (
                    <option key={assistant} value={assistant}>
                      {assistant}
                    </option>
                  ))}
                </select>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                  {selectedAssistant !== 'All Assistants' && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAssistant('All Assistants');
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  <ChevronDown className="w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Task</label>
              <div className="relative">
                <select
                  value={selectedTask}
                  onChange={(e) => setSelectedTask(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option>Select Task...</option>
                  <option>Files</option>
                  <option>Commercialization</option>
                  <option>Research</option>
                  <option>Talent Acquisition</option>
                  <option>Documentation</option>
                  <option>Analysis</option>
                  <option>Support</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Functional Area</label>
              <div className="relative">
                <select
                  value={selectedFunctionalArea}
                  onChange={(e) => setSelectedFunctionalArea(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option>Select Functional Area...</option>
                  <option>Research & Development</option>
                  <option>Commercial</option>
                  <option>Human Resources</option>
                  <option>Information Technology</option>
                  <option>Compliance</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Content */}
        <div className="min-h-[400px]">
          {isLoading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading prompts...</p>
            </div>
          ) : activeTab === 'enterprise' ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPrompts.map((prompt) => (
                  <div
                    key={prompt.id}
                    className="prompt-card bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer group relative"
                  >
                    <div onClick={() => handlePromptClick(prompt)} className="h-full">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-xs font-medium text-gray-500">{prompt.assistant}</span>
                          </div>
                          <h3 className="text-sm font-medium text-gray-900 leading-relaxed mb-2 group-hover:text-orange-600 transition-colors">
                            {prompt.title}
                          </h3>
                        </div>
                        <button className="text-gray-300 hover:text-orange-500 transition-colors flex-shrink-0 ml-2">
                          <Heart className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed mb-4">
                        {prompt.description}
                      </p>

                      {prompt.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {prompt.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              {filteredPrompts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPrompts.map((prompt) => (
                    <div
                      key={prompt.id}
                      className="prompt-card bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer group relative"
                    >
                      <div onClick={() => handlePromptClick(prompt)} className="h-full">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-xs font-medium text-gray-500">{prompt.assistant}</span>
                              <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">Your Prompt</span>
                            </div>
                            <h3 className="text-sm font-medium text-gray-900 leading-relaxed mb-2 group-hover:text-orange-600 transition-colors">
                              {prompt.title}
                            </h3>
                          </div>
                          <button className="text-gray-300 hover:text-orange-500 transition-colors flex-shrink-0 ml-2">
                            <Heart className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed mb-4">
                          {prompt.description}
                        </p>

                        {prompt.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {prompt.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {userPromptsCount === 0 ? 'No personal prompts yet' : 'No prompts found'}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {userPromptsCount === 0 
                      ? 'Create your first prompt to get started' 
                      : 'Try adjusting your search terms or filters'
                    }
                  </p>
                </div>
              )}
            </>
          )}

          {filteredPrompts.length === 0 && activeTab === 'enterprise' && !isLoading && (
            <div className="text-center py-16">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No prompts found</h3>
              <p className="text-gray-500">Try adjusting your search terms or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromptCatalogPage;