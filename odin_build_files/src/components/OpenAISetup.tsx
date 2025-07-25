import React, { useState } from 'react';
import { X, Key, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';

interface OpenAISetupProps {
  isOpen: boolean;
  onClose: () => void;
  onApiKeySet: (apiKey: string) => void;
  currentApiKey?: string | null;
}

const OpenAISetup: React.FC<OpenAISetupProps> = ({ 
  isOpen, 
  onClose, 
  onApiKeySet, 
  currentApiKey 
}) => {
  const [apiKey, setApiKey] = useState(currentApiKey || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const hasEnvKey = !!import.meta.env.VITE_OPENAI_API_KEY;

  const handleSave = async () => {
    if (hasEnvKey) {
      onClose();
      return;
    }

    if (!apiKey.trim()) {
      setError('Please enter your OpenAI API key');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Test the API key by making a simple request
      const response = await fetch('https://api.openai.com/v1/models?limit=1', {
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Invalid API key or network error');
      }

      onApiKeySet(apiKey.trim());
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1500);
    } catch (err) {
      setError('Invalid API key. Please check your key and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = () => {
    if (hasEnvKey) {
      onClose();
      return;
    }
    setApiKey('');
    onApiKeySet('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Key className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">OpenAI API Setup</h2>
              <p className="text-sm text-gray-500">Connect your OpenAI account</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {hasEnvKey ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-800">
                  <p className="font-medium mb-1">Environment API Key Detected</p>
                  <p>Your OpenAI API key is configured in the environment variables. This is the most secure way to store your API key.</p>
                </div>
              </div>
            </div>
          ) : (
            <>
          <div>
            <p className="text-sm text-gray-600 mb-4">
              To load your custom assistants from OpenAI, please provide your API key. 
              Your key will be stored locally and used only to fetch your assistants.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">How to get your API key:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Go to <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">OpenAI API Keys page</a></li>
                    <li>Click "Create new secret key"</li>
                    <li>Copy the key and paste it below</li>
                  </ol>
                </div>
              </div>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              OpenAI API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>
            </>
          )}

          {error && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center space-x-2 text-green-600 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>API key validated successfully!</span>
            </div>
          )}

          {!hasEnvKey && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-800 mb-2">Privacy & Security</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Your API key is stored locally in your browser</li>
              <li>• We never send your key to our servers</li>
              <li>• You can remove it at any time</li>
              <li>• Only used to fetch your OpenAI assistants</li>
            </ul>
          </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div>
            {currentApiKey && !hasEnvKey && (
              <button
                onClick={handleRemove}
                className="text-sm text-red-600 hover:text-red-700 transition-colors"
              >
                Remove API Key
              </button>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              disabled={isLoading}
            >
              {hasEnvKey ? 'Close' : 'Cancel'}
            </button>
            {!hasEnvKey && (
            <button
              onClick={handleSave}
              disabled={isLoading || !apiKey.trim()}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              <span>{isLoading ? 'Testing...' : 'Save & Test'}</span>
            </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpenAISetup;