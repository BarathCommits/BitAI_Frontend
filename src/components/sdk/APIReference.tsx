/**
 * APIReference Component
 * 
 * PURPOSE: Displays API endpoint documentation with examples.
 * 
 * BEST PRACTICE - Data Separation:
 * API endpoint data is stored in a separate file (apiEndpoints.ts).
 * This makes it:
 * - Easy to update API docs without touching component code
 * - Reusable (other components can import the same data)
 * - Easier to maintain (all API data in one place)
 * 
 * BEST PRACTICE - Component State:
 * This component manages its own state (selectedCategory) because:
 * - It's only used within this component
 * - No other component needs to know about it
 * - It's a UI concern (which tab is active), not business logic
 * 
 * Rule: If state is only used in one component, keep it there.
 * If multiple components need it, lift it to a parent or use a global store.
 */

import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { apiEndpoints, ApiEndpoint } from './apiEndpoints';
import {
  Globe,
  Lock,
  AlertCircle,
  Copy,
  CheckCircle
} from 'lucide-react';

/**
 * Props Interface
 * 
 * Notice: This component receives fewer props than SDKIntegrationTab.
 * That's because it manages its own category selection state.
 * 
 * BEST PRACTICE: Only pass props that are truly needed.
 * Don't pass data "just in case" - it makes components harder to understand.
 */
interface APIReferenceProps {
  onCopyCode: (code: string, id: string) => void;  // Function to copy code (from parent)
  copiedCode: string | null;                        // Which code was copied (from parent)
}

export const APIReference: React.FC<APIReferenceProps> = ({ onCopyCode, copiedCode }) => {
  /**
   * LOCAL STATE - Best Practice
   * 
   * This state is local to this component because:
   * - Only this component cares which category is selected
   * - No parent or sibling components need this information
   * - It's a UI state (not business logic)
   * 
   * When to use local state vs props:
   * - Local state: Data only this component uses
   * - Props: Data shared with parent or siblings
   * - Global state (like Zustand): Data used across many unrelated components
   */
  const [selectedCategory, setSelectedCategory] = useState<string>('authentication');

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
                          onClick={() => onCopyCode(endpoint.example!.request, `req-${idx}`)}
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
                          onClick={() => onCopyCode(endpoint.example!.response, `res-${idx}`)}
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
              onClick={() => onCopyCode('http://localhost:3000/api/v1', 'base-url')}
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
            {['authentication', 'ai', 'dapps', 'wallet', 'solana'].map((cat) => (
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

