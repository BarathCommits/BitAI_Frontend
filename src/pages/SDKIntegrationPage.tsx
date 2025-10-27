import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useBuiltInWallet } from '../hooks/useBuiltInWallet';
import { 
  Code, 
  BookOpen, 
  Download, 
  CheckCircle, 
  Copy, 
  ExternalLink,
  Star,
  TrendingUp,
  Package,
  Terminal,
  FileCode,
  Zap,
  Globe,
  Lock,
  MessageSquare,
  Wallet,
  Shield,
  AlertCircle,
  Info,
  Layers,
  Database,
  Key,
  ArrowRight
} from 'lucide-react';
import sdkData from '../data/sdk-data.json';

interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  auth: boolean;
  params?: { name: string; type: string; required: boolean; description: string }[];
  body?: { name: string; type: string; required: boolean; description: string }[];
  response?: string;
  example?: {
    request: string;
    response: string;
  };
}

export const SDKIntegrationPage: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<any>(sdkData.languages[0]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sdk' | 'what-is-sdk' | 'api'>('sdk');
  const [selectedCategory, setSelectedCategory] = useState<string>('authentication');
  const { connectedWallets } = useBuiltInWallet();
  const theme = connectedWallets.length > 0 ? 'cyberpunk' : 'modern';

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const officialLanguages = sdkData.languages.filter(lang => lang.official);
  const communityLanguages = sdkData.languages.filter(lang => !lang.official);

  // API Endpoints data
  const apiEndpoints: { [key: string]: ApiEndpoint[] } = {
    authentication: [
      {
        method: 'POST',
        path: '/api/v1/auth/wallet/nonce',
        description: 'Generate a nonce for wallet signature authentication',
        auth: false,
        body: [
          { name: 'address', type: 'string', required: true, description: 'Ethereum wallet address' }
        ],
        example: {
          request: `fetch('http://localhost:3000/api/v1/auth/wallet/nonce', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' 
  })
});`,
          response: `{
  "success": true,
  "data": { "nonce": "0xa1b2c3d4e5f6..." }
}`
        }
      },
      {
        method: 'POST',
        path: '/api/v1/auth/wallet/verify',
        description: 'Verify wallet signature and get JWT token',
        auth: false,
        body: [
          { name: 'address', type: 'string', required: true, description: 'Ethereum wallet address' },
          { name: 'message', type: 'string', required: true, description: 'Signed message containing nonce' },
          { name: 'signature', type: 'string', required: true, description: 'Wallet signature' }
        ],
        example: {
          request: `fetch('http://localhost:3000/api/v1/auth/wallet/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    message: 'Sign in to Safe - Nonce: 0xa1b2c3d4e5f6...',
    signature: '0x123abc...'
  })
});`,
          response: `{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
    }
  }
}`
        }
      }
    ],
    ai: [
      {
        method: 'POST',
        path: '/api/v1/ai/chat',
        description: 'Chat with AI assistant',
        auth: true,
        body: [
          { name: 'message', type: 'string', required: true, description: 'User message' },
          { name: 'userId', type: 'string', required: true, description: 'User ID or "anonymous"' },
          { name: 'walletAddress', type: 'string', required: false, description: 'User wallet address for balance queries' }
        ],
        example: {
          request: `fetch('http://localhost:3000/api/v1/ai/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGc...'
  },
  body: JSON.stringify({
    message: 'What is my ETH balance?',
    userId: 'user123',
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
  })
});`,
          response: `{
  "success": true,
  "data": {
    "message": "Your current ETH balance is 2.5 ETH",
    "provider": "gemini"
  }
}`
        }
      }
    ],
    dapps: [
      {
        method: 'GET',
        path: '/api/v1/dapps',
        description: 'List all dApps in the Safe AppStore',
        auth: false,
        params: [
          { name: 'page', type: 'number', required: false, description: 'Page number (default: 1)' },
          { name: 'limit', type: 'number', required: false, description: 'Items per page (default: 20)' },
          { name: 'category', type: 'string', required: false, description: 'Filter by category' }
        ],
        example: {
          request: `fetch('http://localhost:3000/api/v1/dapps?page=1&limit=20&category=defi');`,
          response: `{
  "success": true,
  "data": [{
    "id": "uniswap",
    "name": "Uniswap",
    "category": "defi",
    "url": "https://app.uniswap.org"
  }]
}`
        }
      },
      {
        method: 'POST',
        path: '/api/v1/dapps/submit',
        description: 'Submit a new dApp to the Safe AppStore',
        auth: true,
        body: [
          { name: 'name', type: 'string', required: true, description: 'dApp name' },
          { name: 'url', type: 'string', required: true, description: 'dApp URL' },
          { name: 'category', type: 'string', required: true, description: 'Category' },
          { name: 'description', type: 'string', required: true, description: 'Short description' }
        ],
        example: {
          request: `fetch('http://localhost:3000/api/v1/dapps/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGc...'
  },
  body: JSON.stringify({
    name: 'My DeFi App',
    url: 'https://mydefi.app',
    category: 'defi',
    description: 'Yield farming platform'
  })
});`,
          response: `{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "status": "pending"
  }
}`
        }
      }
    ],
    wallet: [
      {
        method: 'POST',
        path: '/api/v1/wallet/connect',
        description: 'Connect a wallet to user account',
        auth: true,
        body: [
          { name: 'address', type: 'string', required: true, description: 'Wallet address' },
          { name: 'provider', type: 'string', required: true, description: 'Wallet provider (e.g., "MetaMask")' },
          { name: 'chainId', type: 'number', required: true, description: 'Chain ID' }
        ],
        example: {
          request: `fetch('http://localhost:3000/api/v1/wallet/connect', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGc...'
  },
  body: JSON.stringify({
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    provider: 'MetaMask',
    chainId: 1
  })
});`,
          response: `{
  "success": true,
  "data": {
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "isPrimary": true
  }
}`
        }
      }
    ]
  };

  const renderWhatIsSDK = () => (
    <div className="space-y-8">
      <Card className="bg-gradient-to-r from-primary-50 to-accent-50 border-primary-200">
        <CardContent className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-primary-600 p-4 rounded-lg">
              <Package className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-secondary-900">What is an SDK?</h1>
          </div>
          <p className="text-lg text-secondary-700 mb-4">
            <strong>SDK = Software Development Kit</strong>
          </p>
          <p className="text-secondary-700">
            An SDK is a pre-built library or package that developers install to easily interact with a platform (like Safe AppStore) 
            <strong> without writing complex API calls manually</strong>.
          </p>
        </CardContent>
      </Card>

      {/* Comparison */}
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold text-secondary-900">💡 Comparison: Without vs With SDK</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-l-4 border-red-500 pl-4">
              <h3 className="font-bold text-red-700 mb-2">❌ Without SDK (Hard Way)</h3>
              <pre className="bg-secondary-900 text-white p-4 rounded-lg text-xs overflow-x-auto">
{`// Manually make API calls
const response = await fetch(
  'http://localhost:3000/api/dapps/submit',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer token123'
    },
    body: JSON.stringify({
      name: "My dApp",
      url: "https://myapp.com",
      // ... 20 more fields
    })
  }
);
// Handle errors manually
// Parse response manually`}
              </pre>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-bold text-green-700 mb-2">✅ With SDK (Easy Way)</h3>
              <pre className="bg-secondary-900 text-white p-4 rounded-lg text-xs overflow-x-auto">
{`// Just install and use
import { BitAIClient } from 'bitai-sdk';

const client = new BitAIClient();

// One line!
await client.dapps.submit({
  name: "My dApp",
  url: "https://myapp.com"
});

// SDK handles:
// ✅ Authentication
// ✅ Error handling
// ✅ Validation`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefits */}
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold text-secondary-900">✅ Benefits of Using SDKs</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-primary-700 mb-3">For Developers:</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Zap className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-secondary-700"><strong>Faster development</strong> - Install & use immediately</span>
                </li>
                <li className="flex items-start gap-2">
                  <Code className="w-5 h-5 text-blue-600 mt-0.5" />
                  <span className="text-secondary-700"><strong>Less code</strong> - One line vs 50 lines</span>
                </li>
                <li className="flex items-start gap-2">
                  <FileCode className="w-5 h-5 text-purple-600 mt-0.5" />
                  <span className="text-secondary-700"><strong>Type safety</strong> - TypeScript types included</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-red-600 mt-0.5" />
                  <span className="text-secondary-700"><strong>Error handling</strong> - Built-in retries</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-accent-700 mb-3">For Safe Platform:</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-secondary-700"><strong>Standardized</strong> - All developers use same format</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <span className="text-secondary-700"><strong>Validation</strong> - SDK validates before sending</span>
                </li>
                <li className="flex items-start gap-2">
                  <Layers className="w-5 h-5 text-purple-600 mt-0.5" />
                  <span className="text-secondary-700"><strong>Versioning</strong> - Control features</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <span className="text-secondary-700"><strong>Developer adoption</strong> - Easy = more developers</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How AI Actions Work */}
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold text-secondary-900">🎯 How AI Actions Work</h2>
        </CardHeader>
        <CardContent>
          <p className="text-secondary-700 mb-4">
            When developers submit dApps via SDK, they configure "actions" that tell the AI how to interact with their app:
          </p>
          <div className="bg-gradient-to-r from-green-50 to-yellow-50 p-6 rounded-lg">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</div>
                <p className="text-secondary-800">User says: <strong>"Swap 100 USDC for ETH"</strong></p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</div>
                <p className="text-secondary-800">AI thinks: <em>"User wants to use the 'swap' action"</em></p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</div>
                <p className="text-secondary-800">AI opens: <strong>dApp with swap interface ready</strong></p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAPIReference = () => {
    const renderEndpoints = (category: string) => {
      const endpoints = apiEndpoints[category];
      if (!endpoints) return null;

      return (
        <div className="space-y-6">
          {endpoints.map((endpoint, idx) => (
            <Card key={idx}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`px-3 py-1 rounded-lg font-mono text-sm font-bold ${
                          endpoint.method === 'GET'
                            ? 'bg-blue-100 text-blue-700'
                            : endpoint.method === 'POST'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {endpoint.method}
                      </span>
                      <code className="text-lg font-mono text-secondary-900">{endpoint.path}</code>
                    </div>
                    <p className="text-secondary-600">{endpoint.description}</p>
                  </div>
                  {endpoint.auth ? (
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm flex items-center gap-1">
                      <Lock className="w-4 h-4" />
                      Auth
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      Public
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Parameters */}
                {endpoint.params && endpoint.params.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-secondary-900 mb-2">Query Parameters:</h4>
                    <div className="bg-secondary-50 rounded-lg p-4 space-y-2">
                      {endpoint.params.map((param, pidx) => (
                        <div key={pidx} className="flex items-start gap-2 text-sm">
                          <code className="bg-white px-2 py-1 rounded border">{param.name}</code>
                          <span className="text-xs text-secondary-600">{param.type}</span>
                          {param.required && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">required</span>}
                          <span className="text-secondary-700">- {param.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Body */}
                {endpoint.body && endpoint.body.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-secondary-900 mb-2">Request Body:</h4>
                    <div className="bg-secondary-50 rounded-lg p-4 space-y-2">
                      {endpoint.body.map((param, bidx) => (
                        <div key={bidx} className="flex items-start gap-2 text-sm">
                          <code className="bg-white px-2 py-1 rounded border">{param.name}</code>
                          <span className="text-xs text-secondary-600">{param.type}</span>
                          {param.required && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">required</span>}
                          <span className="text-secondary-700">- {param.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Example */}
                {endpoint.example && (
                  <div>
                    <h4 className="font-semibold text-secondary-900 mb-2">Example:</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between bg-secondary-800 text-white px-4 py-2 rounded-t-lg">
                          <span className="text-sm font-semibold">Request</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-secondary-700"
                            onClick={() => handleCopyCode(endpoint.example!.request, `req-${idx}`)}
                          >
                            {copiedCode === `req-${idx}` ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                        <pre className="bg-secondary-900 text-white p-4 rounded-b-lg text-sm overflow-x-auto">
                          <code>{endpoint.example.request}</code>
                        </pre>
                      </div>
                      <div>
                        <div className="flex items-center justify-between bg-secondary-800 text-white px-4 py-2 rounded-t-lg">
                          <span className="text-sm font-semibold">Response</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-secondary-700"
                            onClick={() => handleCopyCode(endpoint.example!.response, `res-${idx}`)}
                          >
                            {copiedCode === `res-${idx}` ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                        <pre className="bg-secondary-900 text-white p-4 rounded-b-lg text-sm overflow-x-auto">
                          <code>{endpoint.example.response}</code>
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      );
    };

    return (
      <div className="space-y-6">
        {/* Base URL */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Globe className="w-6 h-6 text-primary-600" />
              <div>
                <h2 className="text-2xl font-bold text-secondary-900">Base URL</h2>
                <p className="text-secondary-600">All API endpoints are relative to this base URL</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-secondary-900 rounded-lg p-4 flex items-center justify-between">
              <code className="text-white font-mono text-lg">http://localhost:3000/api/v1</code>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-secondary-700"
                onClick={() => handleCopyCode('http://localhost:3000/api/v1', 'base-url')}
              >
                {copiedCode === 'base-url' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Category Tabs */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-2 flex-wrap">
              {['authentication', 'ai', 'dapps', 'wallet'].map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className="capitalize"
                >
                  {cat}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Endpoints */}
        {renderEndpoints(selectedCategory)}

        {/* Error Handling */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <h2 className="text-2xl font-bold text-secondary-900">Error Handling</h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-secondary-900 mb-3">Error Response Format:</h3>
              <div className="bg-secondary-900 text-white p-4 rounded-lg">
                <pre className="text-sm">
{`{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}`}
                </pre>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-secondary-900 mb-3">Common Status Codes:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-red-50 border-l-4 border-red-500 p-3">
                  <code className="font-bold text-red-900">401 Unauthorized</code>
                  <p className="text-sm text-red-800 mt-1">Invalid authentication token</p>
                </div>
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3">
                  <code className="font-bold text-yellow-900">400 Bad Request</code>
                  <p className="text-sm text-yellow-800 mt-1">Invalid request parameters</p>
                </div>
                <div className="bg-orange-50 border-l-4 border-orange-500 p-3">
                  <code className="font-bold text-orange-900">404 Not Found</code>
                  <p className="text-sm text-orange-800 mt-1">Resource not found</p>
                </div>
                <div className="bg-gray-50 border-l-4 border-gray-500 p-3">
                  <code className="font-bold text-gray-900">500 Server Error</code>
                  <p className="text-sm text-gray-800 mt-1">Server error - try again later</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      theme === 'cyberpunk' 
        ? 'cyberpunk-theme' 
        : 'bg-secondary-50'
    }`}>
      {/* Hero Section */}
      <section className={`text-white py-16 transition-all duration-500 ${
        theme === 'cyberpunk' 
          ? 'cyberpunk-card' 
          : 'bg-gradient-to-r from-primary-600 to-accent-600'
      }`}>
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className={`backdrop-blur-sm rounded-full p-4 transition-all duration-300 ${
                theme === 'cyberpunk' 
                  ? 'bg-white/10' 
                  : 'bg-white/20'
              }`}>
                <Code className="w-12 h-12" />
              </div>
            </div>
            <h1 className={`text-4xl md:text-5xl font-bold mb-4 transition-all duration-300 ${
              theme === 'cyberpunk' 
                ? 'cyberpunk-gradient-text cyberpunk-font' 
                : ''
            }`}>
              {theme === 'cyberpunk' ? 'SAFE SDK & API DOCUMENTATION' : 'Safe SDK & API Documentation'}
            </h1>
            <p className={`text-xl mb-8 transition-all duration-300 ${
              theme === 'cyberpunk' 
                ? 'text-white/90 cyberpunk-font' 
                : 'text-white/90'
            }`}>
              {theme === 'cyberpunk' 
                ? 'Everything you need to integrate Safe AI and Web3 features into your applications' 
                : 'Everything you need to integrate Safe AI and Web3 features into your applications'}
            </p>
            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <Package className="w-4 h-4" />
                <span>{sdkData.languages.length}+ Languages</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <BookOpen className="w-4 h-4" />
                <span>Complete API Reference</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <Star className="w-4 h-4" />
                <span>v{sdkData.version}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-12">
        {/* Tab Navigation */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex bg-white rounded-lg shadow-sm p-1">
            <button
              onClick={() => setActiveTab('what-is-sdk')}
              className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeTab === 'what-is-sdk'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-secondary-600 hover:text-secondary-900'
              }`}
            >
              <Package className="w-5 h-5" />
              What is SDK?
            </button>
            <button
              onClick={() => setActiveTab('sdk')}
              className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeTab === 'sdk'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-secondary-600 hover:text-secondary-900'
              }`}
            >
              <Code className="w-5 h-5" />
              SDK Integration
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeTab === 'api'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-secondary-600 hover:text-secondary-900'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              API Reference
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'what-is-sdk' && renderWhatIsSDK()}
        
        {activeTab === 'sdk' && (
          <div className="space-y-12">
            {/* Language Selection */}
            <section>
              <h2 className="text-2xl font-bold text-secondary-900 mb-6">
                Choose Your Language
              </h2>
              
              {/* Official SDKs */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-secondary-700 mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Official SDKs
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {officialLanguages.map(lang => (
                    <Card
                      key={lang.id}
                      hover
                      className={`cursor-pointer transition-all ${
                        selectedLanguage.id === lang.id
                          ? 'ring-2 ring-primary-500 bg-primary-50'
                          : ''
                      }`}
                      onClick={() => setSelectedLanguage(lang)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-4xl">{lang.icon}</span>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                            Official
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                          {lang.name}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {lang.bestFor.slice(0, 3).map((use: string) => (
                            <span
                              key={use}
                              className="text-xs bg-secondary-100 text-secondary-700 px-2 py-1 rounded"
                            >
                              {use}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Community SDKs */}
              {communityLanguages.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-secondary-700 mb-4 flex items-center gap-2">
                    <FileCode className="w-5 h-5 text-blue-500" />
                    Community SDKs
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {communityLanguages.map(lang => (
                      <Card
                        key={lang.id}
                        hover
                        className={`cursor-pointer transition-all ${
                          selectedLanguage.id === lang.id
                            ? 'ring-2 ring-primary-500 bg-primary-50'
                            : ''
                        }`}
                        onClick={() => setSelectedLanguage(lang)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{lang.icon}</span>
                            <h3 className="text-sm font-semibold text-secondary-900">
                              {lang.name}
                            </h3>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Selected Language Documentation */}
            <section className="space-y-8">
              {/* Installation */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Download className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-secondary-900">
                        Installation
                      </h2>
                      <p className="text-secondary-600">
                        Get started with {selectedLanguage.name}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-secondary-900 rounded-lg p-4 relative">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-secondary-400 text-sm">
                        <Terminal className="w-4 h-4" />
                        <span>{selectedLanguage.install.manager}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyCode(selectedLanguage.install.command, 'install')}
                        className="text-white hover:bg-secondary-700"
                      >
                        {copiedCode === 'install' ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <pre className="text-white font-mono text-sm overflow-x-auto">
                      <code>{selectedLanguage.install.command}</code>
                    </pre>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Start */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Zap className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-secondary-900">
                        Quick Start
                      </h2>
                      <p className="text-secondary-600">
                        Start building in minutes
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Import */}
                  <div>
                    <h3 className="text-sm font-semibold text-secondary-700 mb-2">1. Import the SDK</h3>
                    <div className="bg-secondary-900 rounded-lg p-4 relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyCode(selectedLanguage.quickStart.import, 'import')}
                        className="absolute top-2 right-2 text-white hover:bg-secondary-700"
                      >
                        {copiedCode === 'import' ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                      <pre className="text-white font-mono text-sm overflow-x-auto">
                        <code>{selectedLanguage.quickStart.import}</code>
                      </pre>
                    </div>
                  </div>

                  {/* Initialize */}
                  <div>
                    <h3 className="text-sm font-semibold text-secondary-700 mb-2">2. Initialize the Client</h3>
                    <div className="bg-secondary-900 rounded-lg p-4 relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyCode(selectedLanguage.quickStart.initialize, 'init')}
                        className="absolute top-2 right-2 text-white hover:bg-secondary-700"
                      >
                        {copiedCode === 'init' ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                      <pre className="text-white font-mono text-sm overflow-x-auto">
                        <code>{selectedLanguage.quickStart.initialize}</code>
                      </pre>
                    </div>
                  </div>

                  {/* Example */}
                  <div>
                    <h3 className="text-sm font-semibold text-secondary-700 mb-2">3. Make Your First Request</h3>
                    <div className="bg-secondary-900 rounded-lg p-4 relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyCode(selectedLanguage.quickStart.example, 'example')}
                        className="absolute top-2 right-2 text-white hover:bg-secondary-700"
                      >
                        {copiedCode === 'example' ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                      <pre className="text-white font-mono text-sm overflow-x-auto whitespace-pre-wrap">
                        <code>{selectedLanguage.quickStart.example}</code>
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Features */}
              <Card>
                <CardHeader>
                  <h2 className="text-2xl font-bold text-secondary-900">
                    Key Features
                  </h2>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedLanguage.features.map((feature: string) => (
                      <div key={feature} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-secondary-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Code Examples */}
              <Card>
                <CardHeader>
                  <h2 className="text-2xl font-bold text-secondary-900">
                    Code Examples
                  </h2>
                </CardHeader>
                <CardContent className="space-y-6">
                  {selectedLanguage.codeExamples.map((example: any, idx: number) => (
                    <div key={idx}>
                      <h3 className="text-lg font-semibold text-secondary-900 mb-3">
                        {example.title}
                      </h3>
                      <div className="bg-secondary-900 rounded-lg p-4 relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyCode(example.code, `example-${idx}`)}
                          className="absolute top-2 right-2 text-white hover:bg-secondary-700"
                        >
                          {copiedCode === `example-${idx}` ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                        <pre className="text-white font-mono text-sm overflow-x-auto whitespace-pre-wrap">
                          <code>{example.code}</code>
                        </pre>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Documentation Links */}
              <Card>
                <CardHeader>
                  <h2 className="text-2xl font-bold text-secondary-900">
                    Documentation & Resources
                  </h2>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <a
                      href={selectedLanguage.docs.quickStart}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors"
                    >
                      <BookOpen className="w-6 h-6 text-primary-600" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-secondary-900">Quick Start Guide</h3>
                        <p className="text-sm text-secondary-600">Step-by-step tutorial</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-secondary-400" />
                    </a>

                    <a
                      href={selectedLanguage.docs.apiReference}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors"
                    >
                      <Code className="w-6 h-6 text-blue-600" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-secondary-900">API Reference</h3>
                        <p className="text-sm text-secondary-600">Complete API docs</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-secondary-400" />
                    </a>

                    <a
                      href={selectedLanguage.docs.examples}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors"
                    >
                      <FileCode className="w-6 h-6 text-green-600" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-secondary-900">Code Examples</h3>
                        <p className="text-sm text-secondary-600">Working examples</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-secondary-400" />
                    </a>

                    <a
                      href={selectedLanguage.docs.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors"
                    >
                      <Package className="w-6 h-6 text-secondary-600" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-secondary-900">GitHub Repository</h3>
                        <p className="text-sm text-secondary-600">View source code</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-secondary-400" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        )}

        {activeTab === 'api' && renderAPIReference()}
      </div>
    </div>
  );
};

export default SDKIntegrationPage;
