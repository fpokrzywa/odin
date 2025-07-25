import React, { useState } from 'react';
import { X, Search, Heart, ExternalLink, ChevronDown } from 'lucide-react';
import { mongoService, type MongoPrompt } from '../services/mongoService';
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
}

interface PromptCatalogProps {
  isOpen: boolean;
  onClose: () => void;
  onPromptSelect: (promptText: string, assistantName: string) => void;
  onOpenFullCatalog: () => void;
  selectedAssistant?: string;
}

const PromptCatalog: React.FC<PromptCatalogProps> = ({ 
  isOpen, 
  onClose, 
  onPromptSelect, 
  onOpenFullCatalog, 
  selectedAssistant 
}) => {
  const [activeTab, setActiveTab] = useState<'enterprise' | 'your'>('enterprise');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAssistant, setFilterAssistant] = useState('All Assistants');
  const [selectedTask, setSelectedTask] = useState('Select Task...');
  const [selectedFunctionalArea, setSelectedFunctionalArea] = useState('Select Functional Area...');
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Set the filter to the selected assistant when the overlay opens
  React.useEffect(() => {
    if (isOpen && selectedAssistant) {
      setFilterAssistant(selectedAssistant);
    }
  }, [isOpen, selectedAssistant]);

  // Load prompts from MongoDB when component mounts
  React.useEffect(() => {
    const loadPrompts = async () => {
      if (isOpen) {
        console.log('Loading prompts for PromptCatalog overlay');
        setIsLoading(true);
        try {
          const mongoPrompts = await mongoService.getPrompts();
          console.log('Loaded prompts:', mongoPrompts.length);
          const convertedPrompts: Prompt[] = mongoPrompts.map(prompt => ({
            id: prompt.id,
            title: prompt.title,
            description: prompt.description,
            assistant: prompt.assistant,
            task: prompt.task,
            functionalArea: prompt.functionalArea,
            tags: prompt.tags
          }));
          setPrompts(convertedPrompts);
        } catch (error) {
          console.error('Error loading prompts:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadPrompts();
  }, [isOpen]);

   // All available assistants from the assistants page
  const availableAssistants = [
    getCompanyBotName(),
    'IT Support',
    'HR Support',
    'Advance Policies Assitant',
    'Redact Assistant',
    'ADEPT Assistant',
    'RFP Assistant',
    'RFP Assistant',
    'Resume Assistant'
  ];

  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prompt.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAssistant = filterAssistant === 'All Assistants' || prompt.assistant === filterAssistant;
    const matchesTask = selectedTask === 'Select Task...' || prompt.task === selectedTask;
    const matchesFunctionalArea = selectedFunctionalArea === 'Select Functional Area...' || 
                                 prompt.functionalArea === selectedFunctionalArea;
    
    return matchesSearch && matchesAssistant && matchesTask && matchesFunctionalArea;
  });

  const handlePromptClick = (prompt: Prompt) => {
    // Use the user field data if available, otherwise fall back to description
    const promptText = prompt.user || prompt.description;
    onPromptSelect(promptText, prompt.assistant);
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Prompt Catalog</h2>
          <div className="flex items-center space-x-4">
            <button 
              onClick={onOpenFullCatalog}
              className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 transition-colors"
            >
              <span className="text-sm">View full Prompt Catalog</span>
              <ExternalLink className="w-4 h-4" />
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
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
            Your Prompts
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Assistant</label>
              <div className="relative">
                <select
                  value={filterAssistant}
                  onChange={(e) => setFilterAssistant(e.target.value)}
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
                  {filterAssistant !== 'All Assistants' && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setFilterAssistant('All Assistants');
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  <ChevronDown className="w-4 h-4" />
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
              placeholder="Search prompt..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'enterprise' ? (
            <>
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading prompts...</p>
                </div>
              ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPrompts.map((prompt) => (
                <div
                  key={prompt.id}
                  onClick={() => handlePromptClick(prompt)}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
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

                  <p className="text-xs text-gray-600 leading-relaxed mb-3">
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
              ))}
            </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No personal prompts yet</h3>
              <p className="text-gray-500">Create your first prompt to get started</p>
            </div>
          )}

          {filteredPrompts.length === 0 && activeTab === 'enterprise' && !isLoading && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No prompts found</h3>
              <p className="text-gray-500">Try adjusting your search terms or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromptCatalog;