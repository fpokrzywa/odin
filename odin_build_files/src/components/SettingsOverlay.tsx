import React, { useState } from 'react';
import { X, RotateCcw } from 'lucide-react';
import { getCompanyName } from '../utils/companyConfig';

interface SettingsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsOverlay: React.FC<SettingsOverlayProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [traits, setTraits] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [enableNewResponses, setEnableNewResponses] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('General Questions');
  const [instructions, setInstructions] = useState(`You are a helpful assistant named ${getCompanyName()} Gen AI Storefront. You can't receive files or be added to a tool or application. If you're not sure of an answer, you can say "Sorry, I lack information on that".`);

  const traitOptions = [
    { label: 'Chatty', color: 'text-pink-600 border-pink-300 bg-pink-50' },
    { label: 'Skeptical', color: 'text-pink-600 border-pink-300 bg-pink-50' },
    { label: 'Academic', color: 'text-pink-600 border-pink-300 bg-pink-50' },
    { label: 'Straight shooting', color: 'text-pink-600 border-pink-300 bg-pink-50' },
    { label: 'Encouraging', color: 'text-pink-600 border-pink-300 bg-pink-50' },
    { label: 'Scientific', color: 'text-pink-600 border-pink-300 bg-pink-50' },
    { label: 'Forward thinking', color: 'text-pink-600 border-pink-300 bg-pink-50' }
  ];

  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);

  const handleTraitToggle = (trait: string) => {
    setSelectedTraits(prev => 
      prev.includes(trait) 
        ? prev.filter(t => t !== trait)
        : [...prev, trait]
    );
  };

  const handleReset = () => {
    setName('');
    setRole('');
    setTraits('');
    setAdditionalInfo('');
    setSelectedTraits([]);
    setSelectedCategory('General Questions');
    setInstructions(`You are a helpful assistant named ${getCompanyName()} Gen AI Storefront. You can't receive files or be added to a tool or application. If you're not sure of an answer, you can say "Sorry, I lack information on that".`);
  };

  const handleSave = () => {
    // Handle save logic here
    console.log('Settings saved:', {
      name,
      role,
      traits,
      additionalInfo,
      selectedTraits,
      enableNewResponses,
      selectedCategory,
      instructions
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Customize ChatGPT</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <p className="text-gray-600 text-sm">
            Introduce yourself to get better, and more personalized responses.
          </p>

          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What should ChatGPT call you?
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your preferred name."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Role Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What do you do?
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g., Software Engineer, Data Scientist, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Traits Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What traits should ChatGPT have?
            </label>
            <textarea
              value={traits}
              onChange={(e) => setTraits(e.target.value)}
              placeholder="e.g., Friendly, Professional, Humorous, etc."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Trait Buttons */}
          <div className="flex flex-wrap gap-2">
            {traitOptions.map((trait) => (
              <button
                key={trait.label}
                onClick={() => handleTraitToggle(trait.label)}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  selectedTraits.includes(trait.label)
                    ? trait.color
                    : 'text-gray-600 border-gray-300 bg-white hover:bg-gray-50'
                }`}
              >
                {selectedTraits.includes(trait.label) ? '+ ' : '+ '}{trait.label}
              </button>
            ))}
          </div>

          {/* Reset Button */}
          <div className="flex justify-start">
            <button
              onClick={handleReset}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="text-sm">Reset</span>
            </button>
          </div>

          {/* Additional Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Anything else ChatGPT should know about you?
            </label>
            <textarea
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="Include any additional information that might help ChatGPT understand you better."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Enable Toggle */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <input
                type="checkbox"
                id="enableNewResponses"
                checked={enableNewResponses}
                onChange={(e) => setEnableNewResponses(e.target.checked)}
                className="sr-only"
              />
              <label
                htmlFor="enableNewResponses"
                className={`block w-12 h-6 rounded-full cursor-pointer transition-colors ${
                  enableNewResponses ? 'bg-orange-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                    enableNewResponses ? 'translate-x-6' : 'translate-x-0.5'
                  } mt-0.5`}
                />
              </label>
            </div>
            <span className="text-sm text-gray-700">Enable for new responses</span>
          </div>

          {/* Instructions Section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Instructions</h3>
              <button
                onClick={handleReset}
                className="text-sm text-pink-600 hover:text-pink-700 transition-colors"
              >
                Reset
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Ask BMS ChatGPT to focus on certain topics or define a format for responses for general inquiries.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ask {getCompanyName()} ChatGPT to focus on certain topics or define a format for responses for general inquiries.
              </label>
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option>General Questions</option>
                  <option>Technical Support</option>
                  <option>Research Assistance</option>
                  <option>Document Analysis</option>
                </select>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructions
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsOverlay;