import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { 
  X, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AIProviderConfigModalProps {
  providerId: string | null;
  providerName: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (providerId: string, apiKey: string) => void;
}

export const AIProviderConfigModal: React.FC<AIProviderConfigModalProps> = ({
  providerId,
  providerName,
  isOpen,
  onClose,
  onSave
}) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getProviderInfo = (id: string) => {
    const providers = {
      huggingface: {
        name: 'Hugging Face',
        icon: '🤗',
        description: 'Free open-source AI models',
        setupUrl: 'https://huggingface.co/settings/tokens',
        envVar: 'REACT_APP_HUGGINGFACE_API_KEY',
        instructions: [
          '1. Go to Hugging Face and create an account',
          '2. Navigate to Settings > Access Tokens',
          '3. Create a new token with "Read" permissions',
          '4. Copy the token and paste it below'
        ]
      },
      gemini: {
        name: 'Google Gemini',
        icon: '💎',
        description: 'Advanced AI with Web3 knowledge',
        setupUrl: 'https://makersuite.google.com/app/apikey',
        envVar: 'REACT_APP_GEMINI_API_KEY',
        instructions: [
          '1. Go to Google AI Studio',
          '2. Sign in with your Google account',
          '3. Click "Create API Key"',
          '4. Copy the generated API key below'
        ]
      },
      cohere: {
        name: 'Cohere',
        icon: '🌀',
        description: 'Enterprise-grade AI platform',
        setupUrl: 'https://dashboard.cohere.ai/api-keys',
        envVar: 'REACT_APP_COHERE_API_KEY',
        instructions: [
          '1. Sign up for a Cohere account',
          '2. Go to the API Keys section',
          '3. Create a new API key',
          '4. Copy the key and paste it below'
        ]
      },
      claude: {
        name: 'Anthropic Claude',
        icon: '🧠',
        description: 'Sophisticated reasoning AI',
        setupUrl: 'https://console.anthropic.com/',
        envVar: 'REACT_APP_CLAUDE_API_KEY',
        instructions: [
          '1. Create an Anthropic account',
          '2. Go to the API Keys section',
          '3. Generate a new API key',
          '4. Copy the key and paste it below'
        ]
      }
    };
    return providers[id as keyof typeof providers];
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter an API key');
      return;
    }

    if (!providerId) return;

    setIsLoading(true);
    try {
      // In a real app, you might want to validate the API key here
      await onSave(providerId, apiKey.trim());
      toast.success(`${providerName} API key saved successfully!`);
      onClose();
      setApiKey('');
    } catch (error) {
      toast.error('Failed to save API key. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyEnvVar = () => {
    const providerInfo = providerId ? getProviderInfo(providerId) : null;
    if (providerInfo) {
      navigator.clipboard.writeText(`${providerInfo.envVar}=${apiKey}`);
      toast.success('Environment variable copied to clipboard!');
    }
  };

  const handleOpenSetup = () => {
    const providerInfo = providerId ? getProviderInfo(providerId) : null;
    if (providerInfo) {
      window.open(providerInfo.setupUrl, '_blank');
    }
  };

  if (!isOpen || !providerId) return null;

  const providerInfo = getProviderInfo(providerId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-200">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{providerInfo?.icon}</span>
            <div>
              <h2 className="text-xl font-semibold text-secondary-900">
                Configure {providerName}
              </h2>
              <p className="text-sm text-secondary-600">{providerInfo?.description}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-secondary-500 hover:text-secondary-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-medium text-blue-900 mb-3">Setup Instructions:</h3>
            <ol className="space-y-2 text-sm text-blue-800">
              {providerInfo?.instructions.map((instruction, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="font-medium text-blue-600">{instruction.split(' ')[0]}</span>
                  <span>{instruction.substring(instruction.indexOf(' ') + 1)}</span>
                </li>
              ))}
            </ol>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenSetup}
              className="mt-3"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Setup Page
            </Button>
          </div>

          {/* API Key Input */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-secondary-900">
              API Key
            </label>
            <div className="relative">
              <Input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`Enter your ${providerName} API key`}
                className="pr-20"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowKey(!showKey)}
                  className="h-6 w-6 p-0"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyEnvVar}
                  className="h-6 w-6 p-0"
                  disabled={!apiKey}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-secondary-500">
              Your API key will be stored locally and used to authenticate with {providerName}.
            </p>
          </div>

          {/* Environment Variable Info */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">Environment Variable:</h4>
            <code className="block bg-gray-100 px-3 py-2 rounded text-sm font-mono">
              {providerInfo?.envVar}=your_api_key_here
            </code>
            <p className="text-xs text-gray-600 mt-2">
              Add this to your <code>.env</code> file or use the setup script: <code>npm run setup:env</code>
            </p>
          </div>

          {/* Security Note */}
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Security Note:</p>
                <p className="mt-1">
                  API keys are stored locally in your browser. Never share your API keys with others. 
                  Each provider has usage limits and may charge for excessive usage.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-secondary-200 bg-gray-50">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!apiKey.trim() || isLoading}
            className="flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Save API Key</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
