import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { 
  Code, 
  Copy, 
  CheckCircle, 
  Play,
  AlertCircle,
  Zap,
  FileCode,
  Terminal,
  Plus
} from 'lucide-react';

interface AIAction {
  command: string;
  description: string;
  example: string;
}

export const SDKSubmitPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: '',
    category: 'defi',
    developerEmail: '',
    contractAddress: '',
    chainId: '1',
    aiEnabled: true,
    actions: [] as AIAction[]
  });

  const [newAction, setNewAction] = useState({
    command: '',
    description: '',
    example: ''
  });

  const [showCodePreview, setShowCodePreview] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateSDKCode = () => {
    const actionsCode = formData.actions.length > 0 
      ? `[${formData.actions.map(a => `"${a.command}"`).join(', ')}]`
      : '["swap", "stake", "claim"]';
    
    const promptsCode = formData.actions.length > 0
      ? `[${formData.actions.map(a => `"${a.example}"`).join(', ')}]`
      : '["Swap tokens", "Stake ETH", "Claim rewards"]';

    return `import { BitAIClient } from 'bitai-sdk';

const client = new BitAIClient({
  apiKey: 'your-api-key' // Get from developer portal
});

// Submit your dApp
const submission = await client.dapps.submit({
  name: "${formData.name || 'My dApp'}",
  description: "${formData.description || 'Amazing Web3 application'}",
  url: "${formData.url || 'https://myapp.com'}",
  category: "${formData.category}",
  tags: ["${formData.category}", "web3"], // Add relevant tags
  
  developer: {
    name: "Your Name",
    email: "${formData.developerEmail || 'dev@example.com'}",
    website: "${formData.url || 'https://myapp.com'}"
  },
  
  // Smart contract integration
  smartContracts: [
    {
      address: "${formData.contractAddress || '0x...'}",
      chainId: ${formData.chainId},
      abi: [...] // Your contract ABI
    }
  ],
  
  // AI Integration
  aiIntegration: {
    enabled: ${formData.aiEnabled},
    supportedCommands: ${actionsCode},
    customPrompts: ${promptsCode},
    
    // Action descriptions (helps AI understand what users want)
    actionDescriptions: {${formData.actions.map(a => `
      "${a.command}": "${a.description}"`).join(',')}
    }
  }
});

console.log('✅ Submission ID:', submission.data.id);
console.log('📊 Status:', submission.data.status);
console.log('⭐ Score:', submission.data.score);

// Track submission status
const status = await client.developer.getSubmissionStatus(submission.data.id);
console.log('Current status:', status);`;
  };

  const handleAddAction = () => {
    if (newAction.command && newAction.description && newAction.example) {
      setFormData({
        ...formData,
        actions: [...formData.actions, { ...newAction }]
      });
      setNewAction({ command: '', description: '', example: '' });
    }
  };

  const handleRemoveAction = (index: number) => {
    setFormData({
      ...formData,
      actions: formData.actions.filter((_, i) => i !== index)
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateSDKCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePreview = () => {
    if (formData.name && formData.url) {
      setShowCodePreview(true);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary-600 to-accent-600 text-white py-12">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl font-bold mb-2">Submit Your dApp via SDK</h1>
          <p className="text-white/90 text-lg">
            Programmatic submission with instant validation and feedback
          </p>
        </div>
      </section>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div>
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-bold text-secondary-900">
                  dApp Information
                </h2>
                <p className="text-secondary-600 text-sm">
                  Fill in your dApp details to generate SDK code
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    dApp Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="My Amazing dApp"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    URL *
                  </label>
                  <Input
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://myapp.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what your dApp does..."
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="defi">DeFi</option>
                    <option value="nft">NFT</option>
                    <option value="gaming">Gaming</option>
                    <option value="social">Social</option>
                    <option value="tools">Tools</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Developer Email *
                  </label>
                  <Input
                    type="email"
                    value={formData.developerEmail}
                    onChange={(e) => setFormData({ ...formData, developerEmail: e.target.value })}
                    placeholder="dev@example.com"
                  />
                </div>

                {/* Divider */}
                <div className="border-t border-secondary-200 pt-4">
                  <h3 className="font-semibold text-secondary-900 mb-3">Smart Contract (Optional)</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Contract Address
                    </label>
                    <Input
                      value={formData.contractAddress}
                      onChange={(e) => setFormData({ ...formData, contractAddress: e.target.value })}
                      placeholder="0x..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Chain ID
                    </label>
                    <select
                      value={formData.chainId}
                      onChange={(e) => setFormData({ ...formData, chainId: e.target.value })}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="1">Ethereum (1)</option>
                      <option value="137">Polygon (137)</option>
                      <option value="56">BSC (56)</option>
                      <option value="42161">Arbitrum (42161)</option>
                      <option value="10">Optimism (10)</option>
                    </select>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-secondary-200 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-secondary-900">AI Integration</h3>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.aiEnabled}
                        onChange={(e) => setFormData({ ...formData, aiEnabled: e.target.checked })}
                        className="w-4 h-4 text-primary-600 rounded"
                      />
                      <span className="text-sm text-secondary-700">Enable AI</span>
                    </label>
                  </div>
                  <p className="text-xs text-secondary-600 mb-3">
                    Define actions that users can perform via AI chat (e.g., "swap tokens", "stake ETH")
                  </p>
                </div>

                {formData.aiEnabled && (
                  <>
                    {/* AI Actions List */}
                    {formData.actions.length > 0 && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-secondary-700">
                          Configured Actions ({formData.actions.length})
                        </label>
                        {formData.actions.map((action, index) => (
                          <div key={index} className="bg-secondary-50 rounded-lg p-3 border border-secondary-200">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <p className="font-medium text-secondary-900">{action.command}</p>
                                <p className="text-xs text-secondary-600">{action.description}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveAction(index)}
                                className="text-red-600 hover:bg-red-50"
                              >
                                Remove
                              </Button>
                            </div>
                            <p className="text-xs text-secondary-500">
                              Example: "{action.example}"
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add New Action */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                      <p className="text-sm font-medium text-blue-900">Add AI Action</p>
                      
                      <div>
                        <label className="block text-xs text-blue-800 mb-1">
                          Command Name
                        </label>
                        <Input
                          value={newAction.command}
                          onChange={(e) => setNewAction({ ...newAction, command: e.target.value })}
                          placeholder="e.g., swap, stake, claim"
                          className="bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-blue-800 mb-1">
                          Description (What does this action do?)
                        </label>
                        <Input
                          value={newAction.description}
                          onChange={(e) => setNewAction({ ...newAction, description: e.target.value })}
                          placeholder="e.g., Swap one token for another"
                          className="bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-blue-800 mb-1">
                          Example Prompt (How users will ask)
                        </label>
                        <Input
                          value={newAction.example}
                          onChange={(e) => setNewAction({ ...newAction, example: e.target.value })}
                          placeholder="e.g., Swap 100 USDC for ETH"
                          className="bg-white"
                        />
                      </div>

                      <Button
                        onClick={handleAddAction}
                        size="sm"
                        disabled={!newAction.command || !newAction.description || !newAction.example}
                        className="w-full"
                        leftIcon={<Plus className="w-4 h-4" />}
                      >
                        Add Action
                      </Button>
                    </div>
                  </>
                )}

                <Button
                  onClick={handlePreview}
                  disabled={!formData.name || !formData.url}
                  className="w-full"
                  leftIcon={<Code className="w-4 h-4" />}
                >
                  Generate SDK Code
                </Button>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card className="mt-6">
              <CardHeader>
                <h3 className="text-lg font-semibold text-secondary-900">
                  SDK Submission Benefits
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-secondary-900">Instant Validation</p>
                      <p className="text-sm text-secondary-600">Get feedback before submission</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-secondary-900">Auto-Approval</p>
                      <p className="text-sm text-secondary-600">High-score submissions go live instantly</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Terminal className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-secondary-900">CI/CD Integration</p>
                      <p className="text-sm text-secondary-600">Automate deployments to Safe AppStore</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Code Preview Section */}
          <div>
            {!showCodePreview ? (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center py-12">
                  <FileCode className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-secondary-700 mb-2">
                    SDK Code Preview
                  </h3>
                  <p className="text-secondary-600">
                    Fill in the form to generate your SDK submission code
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-secondary-900">
                        Generated SDK Code
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        leftIcon={copied ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                      >
                        {copied ? 'Copied!' : 'Copy Code'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-secondary-900 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-white font-mono text-sm whitespace-pre-wrap">
                        <code>{generateSDKCode()}</code>
                      </pre>
                    </div>
                  </CardContent>
                </Card>

                {/* Installation Steps */}
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-secondary-900">
                      How to Use
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-primary-600 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                        1
                      </div>
                      <div>
                        <p className="font-medium text-secondary-900">Install the SDK</p>
                        <div className="bg-secondary-100 rounded px-3 py-2 mt-2">
                          <code className="text-sm">npm install bitai-sdk</code>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="bg-primary-600 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                        2
                      </div>
                      <div>
                        <p className="font-medium text-secondary-900">Copy the generated code</p>
                        <p className="text-sm text-secondary-600">
                          Use the code above in your project
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="bg-primary-600 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                        3
                      </div>
                      <div>
                        <p className="font-medium text-secondary-900">Run and submit</p>
                        <p className="text-sm text-secondary-600">
                          Execute the code to submit your dApp
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="bg-primary-600 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                        4
                      </div>
                      <div>
                        <p className="font-medium text-secondary-900">Track status</p>
                        <p className="text-sm text-secondary-600">
                          Get real-time updates on approval status
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Test Submission */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-blue-900 mb-2">Test Mode Available</p>
                        <p className="text-sm text-blue-800 mb-4">
                          Want to test without actually submitting? Use our sandbox environment to validate your submission.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-blue-600 text-blue-700 hover:bg-blue-100"
                          leftIcon={<Play className="w-4 h-4" />}
                        >
                          Test in Sandbox
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SDKSubmitPage;

