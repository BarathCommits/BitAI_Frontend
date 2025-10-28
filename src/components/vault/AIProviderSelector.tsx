import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { useBuiltInWallet } from '../../hooks/useBuiltInWallet';
import { 
  Brain, 
  Zap, 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Settings,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AIProvider {
  id: string;
  name: string;
  description: string;
  icon: string;
  reliability: 'Very High' | 'High' | 'Medium' | 'Low';
  freeLimit: number;
  cost: number;
  setup: string;
  isActive: boolean;
  isConfigured: boolean;
}

interface AIProviderSelectorProps {
  selectedProvider: string;
  onProviderChange: (providerId: string) => void;
  onConfigureProvider: (providerId: string) => void;
}

export const AIProviderSelector: React.FC<AIProviderSelectorProps> = ({
  selectedProvider,
  onProviderChange,
  onConfigureProvider
}) => {
  const { connectedWallets } = useBuiltInWallet();
  const theme = connectedWallets.length > 0 ? 'cyberpunk' : 'modern';
  
  const [providers] = useState<AIProvider[]>([
    {
      id: 'openai',
      name: 'OpenAI',
      description: 'Most reliable AI with excellent Web3 knowledge',
      icon: '🤖',
      reliability: 'Very High',
      freeLimit: 2000,
      cost: 0,
      setup: '2 minutes',
      isActive: true,
      isConfigured: true // OpenAI is configured in backend
    },
    {
      id: 'huggingface',
      name: 'Hugging Face',
      description: 'Free open-source models with high reliability',
      icon: '🤗',
      reliability: 'High',
      freeLimit: 1000,
      cost: 0,
      setup: '2 minutes',
      isActive: true,
      isConfigured: !!process.env.REACT_APP_HUGGINGFACE_API_KEY && process.env.REACT_APP_HUGGINGFACE_API_KEY !== 'your_huggingface_api_key_here'
    },
    {
      id: 'gemini',
      name: 'Google Gemini',
      description: 'Advanced AI with excellent Web3 knowledge',
      icon: '💎',
      reliability: 'Very High',
      freeLimit: 1500,
      cost: 0,
      setup: '2 minutes',
      isActive: true,
      isConfigured: !!process.env.REACT_APP_GEMINI_API_KEY && process.env.REACT_APP_GEMINI_API_KEY !== 'your_gemini_api_key_here'
    },
    {
      id: 'cohere',
      name: 'Cohere',
      description: 'Enterprise-grade AI for complex queries',
      icon: '🌀',
      reliability: 'High',
      freeLimit: 1000,
      cost: 0,
      setup: '2 minutes',
      isActive: true,
      isConfigured: !!process.env.REACT_APP_COHERE_API_KEY && process.env.REACT_APP_COHERE_API_KEY !== 'your_cohere_api_key_here'
    },
    {
      id: 'claude',
      name: 'Anthropic Claude',
      description: 'Sophisticated reasoning and analysis',
      icon: '🧠',
      reliability: 'High',
      freeLimit: 1000,
      cost: 0,
      setup: '5 minutes',
      isActive: true,
      isConfigured: !!process.env.REACT_APP_CLAUDE_API_KEY && process.env.REACT_APP_CLAUDE_API_KEY !== 'your_claude_api_key_here'
    }
  ]);

  const getReliabilityColor = (reliability: string) => {
    if (theme === 'cyberpunk') {
      switch (reliability) {
        case 'Very High': return 'text-green-400 bg-green-500/20 border border-green-400/50';
        case 'High': return 'text-blue-400 bg-blue-500/20 border border-blue-400/50';
        case 'Medium': return 'text-yellow-400 bg-yellow-500/20 border border-yellow-400/50';
        case 'Low': return 'text-red-400 bg-red-500/20 border border-red-400/50';
        default: return 'text-white/80 bg-gray-500/20 border border-gray-400/50';
      }
    } else {
      switch (reliability) {
        case 'Very High': return 'text-green-600 bg-green-100';
        case 'High': return 'text-blue-600 bg-blue-100';
        case 'Medium': return 'text-yellow-600 bg-yellow-100';
        case 'Low': return 'text-red-600 bg-red-100';
        default: return 'text-gray-600 bg-gray-100';
      }
    }
  };

  const getReliabilityIcon = (reliability: string) => {
    switch (reliability) {
      case 'Very High': return <CheckCircle className="w-4 h-4" />;
      case 'High': return <Shield className="w-4 h-4" />;
      case 'Medium': return <AlertCircle className="w-4 h-4" />;
      case 'Low': return <AlertCircle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const handleProviderSelect = (providerId: string) => {
    const provider = providers.find(p => p.id === providerId);
    if (!provider) return;

    if (!provider.isConfigured) {
      toast.error(`${provider.name} is not configured. Please add your API key first.`);
      onConfigureProvider(providerId);
      return;
    }

    onProviderChange(providerId);
    toast.success(`Switched to ${provider.name} AI provider`);
  };

  const handleConfigure = (providerId: string) => {
    onConfigureProvider(providerId);
  };

  return (
    <Card className={`w-full transition-all duration-300 ${
      theme === 'cyberpunk' ? 'cyberpunk-card' : ''
    }`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className={`w-5 h-5 transition-all duration-300 ${
              theme === 'cyberpunk' 
                ? 'text-white' 
                : 'text-primary-600'
            }`} />
            <h3 className={`text-lg font-semibold transition-all duration-300 ${
              theme === 'cyberpunk' 
                ? 'text-white cyberpunk-font' 
                : 'text-secondary-900'
            }`}>
              {theme === 'cyberpunk' ? 'BIT AI PROVIDER' : 'AI Provider'}
            </h3>
          </div>
          <div className={`flex items-center space-x-2 text-sm transition-all duration-300 ${
            theme === 'cyberpunk' 
              ? 'text-white/80 cyberpunk-font' 
              : 'text-secondary-600'
          }`}>
            <Zap className={`w-4 h-4 transition-all duration-300 ${
              theme === 'cyberpunk' 
                ? 'text-white/80' 
                : ''
            }`} />
            <span>{theme === 'cyberpunk' ? 'Choose your Safe AI assistant' : 'Choose your preferred AI assistant'}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Selection */}
        <div className={`p-4 rounded-lg border transition-all duration-300 ${
          theme === 'cyberpunk' 
            ? 'cyberpunk-card border-blue-400/30' 
            : 'bg-primary-50 border-primary-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {(() => {
                const current = providers.find(p => p.id === selectedProvider);
                return current ? (
                  <>
                    <span className="text-2xl">{current.icon}</span>
                    <div>
                      <h4 className={`font-medium transition-all duration-300 ${
                        theme === 'cyberpunk' 
                          ? 'text-white cyberpunk-font' 
                          : 'text-secondary-900'
                      }`}>{current.name}</h4>
                      <p className={`text-sm transition-all duration-300 ${
                        theme === 'cyberpunk' 
                          ? 'text-white/80 cyberpunk-font' 
                          : 'text-secondary-600'
                      }`}>{current.description}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Settings className={`w-6 h-6 transition-all duration-300 ${
                      theme === 'cyberpunk' 
                        ? 'text-white/60' 
                        : 'text-secondary-400'
                    }`} />
                    <div>
                      <h4 className={`font-medium transition-all duration-300 ${
                        theme === 'cyberpunk' 
                          ? 'text-white cyberpunk-font' 
                          : 'text-secondary-900'
                      }`}>
                        {theme === 'cyberpunk' ? 'NO BIT PROVIDER SELECTED' : 'No Provider Selected'}
                      </h4>
                      <p className={`text-sm transition-all duration-300 ${
                        theme === 'cyberpunk' 
                          ? 'text-white/80 cyberpunk-font' 
                          : 'text-secondary-600'
                      }`}>
                        {theme === 'cyberpunk' ? 'Choose a Safe AI provider below' : 'Choose an AI provider below'}
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReliabilityColor(
                providers.find(p => p.id === selectedProvider)?.reliability || 'Medium'
              )}`}>
                {providers.find(p => p.id === selectedProvider)?.reliability || 'Medium'}
              </span>
              {providers.find(p => p.id === selectedProvider)?.isConfigured ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-500" />
              )}
            </div>
          </div>
        </div>

        {/* Provider Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                theme === 'cyberpunk' 
                  ? (selectedProvider === provider.id
                      ? 'cyberpunk-card border-blue-400/50'
                      : 'cyberpunk-card border-green-400/30 hover:border-green-400/50')
                  : (selectedProvider === provider.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-secondary-200 hover:border-secondary-300')
              }`}
              onClick={() => handleProviderSelect(provider.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{provider.icon}</span>
                  <div className="flex-1">
                    <h4 className={`font-medium transition-all duration-300 ${
                      theme === 'cyberpunk' 
                        ? 'text-white cyberpunk-font' 
                        : 'text-secondary-900'
                    }`}>{provider.name}</h4>
                    <p className={`text-sm mb-2 transition-all duration-300 ${
                      theme === 'cyberpunk' 
                        ? 'text-white/80 cyberpunk-font' 
                        : 'text-secondary-600'
                    }`}>{provider.description}</p>
                    
                    {/* Provider Stats */}
                    <div className={`flex items-center space-x-4 text-xs transition-all duration-300 ${
                      theme === 'cyberpunk' 
                        ? 'text-white/60 cyberpunk-font' 
                        : 'text-secondary-500'
                    }`}>
                      <div className="flex items-center space-x-1">
                        <div className={`transition-all duration-300 ${
                          theme === 'cyberpunk' ? 'text-white/80' : ''
                        }`}>
                          {getReliabilityIcon(provider.reliability)}
                        </div>
                        <span>{provider.reliability}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className={`w-3 h-3 transition-all duration-300 ${
                          theme === 'cyberpunk' ? 'text-white/80' : ''
                        }`} />
                        <span>{provider.setup}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Zap className={`w-3 h-3 transition-all duration-300 ${
                          theme === 'cyberpunk' ? 'text-white/80' : ''
                        }`} />
                        <span>{provider.freeLimit}/mo free</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  {provider.isConfigured ? (
                    <CheckCircle className={`w-5 h-5 transition-all duration-300 ${
                      theme === 'cyberpunk' ? 'text-green-400' : 'text-green-500'
                    }`} />
                  ) : (
                    <div className="flex flex-col items-end space-y-1">
                      <AlertCircle className={`w-5 h-5 transition-all duration-300 ${
                        theme === 'cyberpunk' ? 'text-yellow-400' : 'text-yellow-500'
                      }`} />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConfigure(provider.id);
                        }}
                        className={`text-xs px-2 py-1 transition-all duration-300 ${
                          theme === 'cyberpunk' ? 'cyberpunk-button' : ''
                        }`}
                      >
                        {theme === 'cyberpunk' ? 'CONFIGURE' : 'Configure'}
                      </Button>
                    </div>
                  )}
                  
                  {selectedProvider === provider.id && (
                    <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Configuration Help */}
        <div className={`p-3 rounded-lg border transition-all duration-300 ${
          theme === 'cyberpunk' 
            ? 'cyberpunk-card border-blue-400/30' 
            : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-start space-x-2">
            <Info className={`w-4 h-4 mt-0.5 transition-all duration-300 ${
              theme === 'cyberpunk' ? 'text-blue-400' : 'text-blue-600'
            }`} />
            <div className={`text-sm transition-all duration-300 ${
              theme === 'cyberpunk' ? 'text-white/80 cyberpunk-font' : 'text-blue-800'
            }`}>
              <p className={`font-medium transition-all duration-300 ${
                theme === 'cyberpunk' ? 'cyberpunk-font' : ''
              }`}>
                {theme === 'cyberpunk' ? 'NEED SAFE AI CONFIGURATION HELP?' : 'Need help configuring AI providers?'}
              </p>
              <p className={`mt-1 transition-all duration-300 ${
                theme === 'cyberpunk' ? 'cyberpunk-font' : ''
              }`}>
                {theme === 'cyberpunk' 
                  ? 'Obtain Safe API keys from the providers above. Configure them in your environment variables or use the Safe setup script: '
                  : 'Get free API keys from the providers above. Configure them in your environment variables or use the setup script: '
                }
                <code className={`px-1 rounded transition-all duration-300 ${
                  theme === 'cyberpunk' 
                    ? 'bg-blue-500/20 text-white border border-blue-400/30' 
                    : 'bg-blue-100'
                }`}>
                  npm run setup:env
                </code>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
