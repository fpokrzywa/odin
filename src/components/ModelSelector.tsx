import React, { useState } from 'react';
import { Check, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';

interface ModelSelectorProps {
  onClose: () => void;
  selectedModel: string;
  onSelectModel: (model: string) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  onClose,
  selectedModel,
  onSelectModel,
}) => {
  const [showMoreModels, setShowMoreModels] = useState(false);
  const [temporaryChat, setTemporaryChat] = useState(false);

  const mainModels = [
    {
      name: 'GPT-4o',
      description: 'Great for most tasks',
      isSelected: selectedModel === 'GPT-4o',
    },
    {
      name: 'o3',
      description: 'Uses advanced reasoning',
      isSelected: selectedModel === 'o3',
    },
    {
      name: 'o3-pro',
      description: 'Best at reasoning',
      isSelected: selectedModel === 'o3-pro',
    },
    {
      name: 'o4-mini',
      description: 'Fastest at advanced reasoning',
      isSelected: selectedModel === 'o4-mini',
    },
    {
      name: 'o4-mini-high',
      description: 'Great at coding and visual reasoning',
      isSelected: selectedModel === 'o4-mini-high',
    },
  ];

  const additionalModels = [
    {
      name: 'GPT-3.5 Turbo',
      description: 'Fast and efficient',
      isSelected: selectedModel === 'GPT-3.5 Turbo',
    },
    {
      name: 'Claude 3.5 Sonnet',
      description: 'Excellent for creative writing',
      isSelected: selectedModel === 'Claude 3.5 Sonnet',
    },
    {
      name: 'Gemini Pro',
      description: 'Strong multimodal capabilities',
      isSelected: selectedModel === 'Gemini Pro',
    },
  ];

  const handleModelSelect = (modelName: string) => {
    onSelectModel(modelName);
  };


  return (
    <div className="max-h-96 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="text-sm text-gray-500 mb-1">Models</div>
      </div>

      {/* Model List */}
      <div className="max-h-80 overflow-y-auto">
        <div className="p-2">
          {mainModels.map((model) => (
            <button
              key={model.name}
              onClick={() => handleModelSelect(model.name)}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
            >
              <div>
                <div className="font-medium text-gray-900">{model.name}</div>
                <div className="text-sm text-gray-500">{model.description}</div>
              </div>
              {model.isSelected && (
                <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
              )}
            </button>
          ))}

          {/* More Models Toggle */}
          <button
            onClick={() => setShowMoreModels(!showMoreModels)}
            className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <span className="font-medium text-gray-900">More models</span>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showMoreModels ? 'rotate-180' : ''}`} />
          </button>

          {/* Additional Models */}
          {showMoreModels && (
            <div className="space-y-1">
              {additionalModels.map((model) => (
                <button
                  key={model.name}
                  onClick={() => handleModelSelect(model.name)}
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                >
                  <div>
                    <div className="font-medium text-gray-900">{model.name}</div>
                    <div className="text-sm text-gray-500">{model.description}</div>
                  </div>
                  {model.isSelected && (
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <RotateCcw className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Temporary Chat</span>
          </div>
          <button
            onClick={() => setTemporaryChat(!temporaryChat)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              temporaryChat ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                temporaryChat ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModelSelector;