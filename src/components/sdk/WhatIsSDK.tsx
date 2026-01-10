/**
 * WhatIsSDK Component
 * 
 * PURPOSE: Explains what an SDK is to users who might not know.
 * 
 * BEST PRACTICE - Single Responsibility:
 * This component has ONE job: explain SDKs. It doesn't handle:
 * - Language selection (that's SDKIntegrationTab's job)
 * - API documentation (that's APIReference's job)
 * - Copying code (handled by parent)
 * 
 * WHY THIS MATTERS:
 * - Easy to find and fix bugs (know exactly where to look)
 * - Easy to update content (all SDK explanation in one place)
 * - Easy to test (test just this component's functionality)
 * - Easy to reuse (could use this component in help docs, tutorials, etc.)
 * 
 * FILE SIZE BEST PRACTICE:
 * This component is ~170 lines. If it grows beyond ~300 lines, consider
 * splitting it further (e.g., separate components for Benefits, Comparison, etc.)
 */

import React from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import {
  Package,
  Zap,
  Code,
  FileCode,
  Shield,
  CheckCircle,
  Layers,
  TrendingUp
} from 'lucide-react';

/**
 * WhatIsSDK Component - Presentational Component
 * 
 * TYPE: Presentational Component (also called "dumb" or "stateless")
 * - Doesn't manage its own state
 * - Doesn't fetch data
 * - Just displays content passed to it or hardcoded
 * 
 * BEST PRACTICE: Keep components like this simple and focused.
 * They're easier to understand, test, and maintain.
 */
export const WhatIsSDK: React.FC = () => {
  return (
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
            An SDK is a pre-built library or package that developers install to easily interact with a platform (like bitAppStore) 
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
};

