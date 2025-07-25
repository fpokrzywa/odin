import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Search, Menu, ChevronUp } from 'lucide-react';
import ModelSelector from './ModelSelector';

interface RightPanelProps {
  isExpanded?: boolean;
  isFullScreen?: boolean;
  onExpandAll?: () => void;
  user?: { email: string } | null;
}

const RightPanel: React.FC<RightPanelProps> = ({ 
  isExpanded = false, 
  isFullScreen = false, 
  onExpandAll,
  user 
}) => {
  const [showSamplePrompts, setShowSamplePrompts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [selectedModel, setSelectedModel] = useState('GPT-4o');

  return (
    <div className={`${isExpanded ? 'flex-1' : 'w-1/2'} bg-white border-l border-gray-200 h-screen flex flex-col relative`}>
      {/* Header with Model Selector */}
      <div className="flex items-center justify-between p-4">
        {isFullScreen && onExpandAll && (
          <button
            onClick={onExpandAll}
            className="p-2 hover:bg-gray-100 rounded transition-colors mr-3"
            title="Expand sidebar"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
        )}
        <div className="relative">
          <button
            onClick={() => setShowModelSelector(!showModelSelector)}
            className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
          >
            <span className="font-semibold text-gray-900">{selectedModel}</span>
            <span className="text-sm text-gray-500">4o</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          
          {/* Dropdown Modal */}
          {showModelSelector && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
              <ModelSelector
                selectedModel={selectedModel}
                onSelectModel={(model) => {
                  setSelectedModel(model);
                  setShowModelSelector(false);
                }}
                onClose={() => setShowModelSelector(false)}
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Moveworks Branding */}
      <div className={`${isExpanded ? 'p-16' : 'p-8'} text-center`}>
        <div className="mb-6">
          <img 
            src="/aw_logo_v1_dark.png" 
            alt="Agentic Weaver Logo" 
            className={`${isExpanded ? 'w-24 h-24' : 'w-16 h-16'} mx-auto mb-4 object-contain`}
          />
        </div>
        
        <h2 className={`${isExpanded ? 'text-4xl' : 'text-2xl'} font-bold text-gray-900 mb-2`}>Agentic Weaver</h2>
       <p className={`text-gray-700 ${isExpanded ? 'text-lg max-w-md mx-auto' : 'text-sm'} leading-relaxed`}>
          {user ? `Welcome back, ${user.email.split('@')[0]}! ` : ''}Use sample resource on the left to experience AI transformation at work
        </p>
      </div>

      {/* Sample Prompts Section */}
      <div className={`${isExpanded ? 'px-16 max-w-2xl mx-auto w-full' : 'px-6'} mb-6`}>
        <button
          onClick={() => setShowSamplePrompts(!showSamplePrompts)}
         className={`w-full flex items-center justify-between ${isExpanded ? 'p-4 text-lg' : 'p-3'} bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors`}
        >
         <span className="font-medium text-orange-900">Sample prompts</span>
          {showSamplePrompts ? (
           <ChevronDown className={`${isExpanded ? 'w-5 h-5' : 'w-4 h-4'} text-orange-600`} />
          ) : (
           <ChevronRight className={`${isExpanded ? 'w-5 h-5' : 'w-4 h-4'} text-orange-600`} />
          )}
        </button>
        
        {showSamplePrompts && (
          <div className="mt-3 space-y-2">
           <div className={`${isExpanded ? 'p-4 text-base' : 'p-3 text-sm'} bg-white border border-orange-200 rounded text-gray-700 hover:bg-orange-50 cursor-pointer transition-colors`}>
              "What is our vacation policy?"
            </div>
           <div className={`${isExpanded ? 'p-4 text-base' : 'p-3 text-sm'} bg-white border border-orange-200 rounded text-gray-700 hover:bg-orange-50 cursor-pointer transition-colors`}>
              "How do I request time off?"
            </div>
           <div className={`${isExpanded ? 'p-4 text-base' : 'p-3 text-sm'} bg-white border border-orange-200 rounded text-gray-700 hover:bg-orange-50 cursor-pointer transition-colors`}>
              "When can I get a laptop refresh?"
            </div>
          </div>
        )}
      </div>

      {/* Search Input */}
      <div className={`${isExpanded ? 'px-16 max-w-2xl mx-auto w-full' : 'px-6'} mt-auto mb-8`}>
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isExpanded ? 'w-5 h-5' : 'w-4 h-4'} text-gray-400`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for answers or give me an action"
           className={`w-full ${isExpanded ? 'pl-12 pr-6 py-4 text-lg' : 'pl-10 pr-4 py-3'} border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all`}
          />
        </div>
      </div>

    </div>
  );
};

export default RightPanel;