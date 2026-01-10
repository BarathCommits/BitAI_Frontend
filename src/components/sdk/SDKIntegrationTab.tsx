/**
 * SDKIntegrationTab Component
 * 
 * PURPOSE: Displays SDK installation and usage instructions for different programming languages.
 * 
 * BEST PRACTICE - Component Props Interface:
 * We define the props interface separately. This helps:
 * - TypeScript catches errors if wrong props are passed
 * - Self-documenting code (you can see what props are needed)
 * - Better IDE autocomplete and hints
 * 
 * BEST PRACTICE - Props vs State:
 * - Props: Data passed FROM parent (like sdkData, selectedLanguage)
 * - State: Data managed BY this component (we don't have any here)
 * 
 * Rule of thumb: If data comes from outside, it's a prop. If it's created here, it's state.
 */

import React, { useMemo } from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { SDKLanguage, SDKData } from '../../types/sdk';
import {
  Download,
  CheckCircle,
  Copy,
  Star,
  FileCode,
  Terminal,
  Zap,
  BookOpen,
  ExternalLink,
  Package
} from 'lucide-react';

/**
 * Props Interface - TypeScript Best Practice
 * 
 * This defines what data this component expects to receive.
 * Think of it like a contract: "If you want to use this component,
 * you MUST provide these props with these types."
 * 
 * Benefits:
 * - Catches errors before code runs
 * - IDE shows helpful hints when using the component
 * - Documents what the component needs
 */
interface SDKIntegrationTabProps {
  sdkData: SDKData;                    // All SDK data (languages, versions, etc.)
  selectedLanguage: SDKLanguage;       // Currently selected programming language
  onLanguageSelect: (lang: SDKLanguage) => void;  // Function to call when user selects a language
  onCopyCode: (code: string, id: string) => void;  // Function to copy code to clipboard
  copiedCode: string | null;          // Which code snippet was just copied (for visual feedback)
}

/**
 * SDKIntegrationTab Component - Container Component
 * 
 * TYPE: Container Component (also called "smart" component)
 * - Receives props from parent
 * - Processes data (filters languages)
 * - Handles user interactions (language selection, copying code)
 * - Passes processed data to child components
 */
export const SDKIntegrationTab: React.FC<SDKIntegrationTabProps> = ({
  sdkData,
  selectedLanguage,
  onLanguageSelect,
  onCopyCode,
  copiedCode
}) => {
  /**
   * useMemo Hook - Performance Best Practice
   * 
   * WHAT IT DOES: Caches the result of a calculation so it doesn't run every render.
   * 
   * WHY WE USE IT HERE:
   * - Filtering arrays can be slow with many items
   * - We only need to recalculate if sdkData.languages changes
   * - Without useMemo, we'd filter on EVERY render (even when nothing changed)
   * 
   * HOW IT WORKS:
   * - First parameter: The calculation to cache
   * - Second parameter: Dependencies (when to recalculate)
   * - Returns: Cached result (only recalculates when dependencies change)
   * 
   * REAL-WORLD ANALOGY:
   * Like caching a search result. If you search for "official languages"
   * and the data hasn't changed, use the cached result instead of searching again.
   */
  const officialLanguages = useMemo(() => 
    sdkData.languages.filter(lang => lang.official),
    [sdkData.languages]  // Only recalculate if languages array changes
  );
  
  const communityLanguages = useMemo(() => 
    sdkData.languages.filter(lang => !lang.official),
    [sdkData.languages]  // Only recalculate if languages array changes
  );

  return (
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
                onClick={() => onLanguageSelect(lang)}
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
                  onClick={() => onLanguageSelect(lang)}
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
                  onClick={() => onCopyCode(selectedLanguage.install.command, 'install')}
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
                  onClick={() => onCopyCode(selectedLanguage.quickStart.import, 'import')}
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
                  onClick={() => onCopyCode(selectedLanguage.quickStart.initialize, 'init')}
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
                  onClick={() => onCopyCode(selectedLanguage.quickStart.example, 'example')}
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
                    onClick={() => onCopyCode(example.code, `example-${idx}`)}
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
                <Package className="w-6 h-6 text-blue-600" />
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
  );
};

