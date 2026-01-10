/**
 * SDK Integration Page - Main Page Component
 * 
 * BEST PRACTICE: This page is kept small and focused on coordination.
 * Instead of putting all 1200+ lines of code in one file, we split it into
 * smaller, reusable components. This makes the code:
 * - Easier to understand (each file has one clear purpose)
 * - Easier to test (test each component separately)
 * - Easier to maintain (fix bugs in one place without affecting others)
 * - Easier to reuse (components can be used in other pages)
 * 
 * Think of it like organizing a library: instead of one giant book with everything,
 * we have separate books for different topics, making it easier to find what you need.
 */

import React, { useState, useCallback } from 'react';
import { useBuiltInWallet } from '../hooks/useBuiltInWallet';
import { 
  Code, 
  BookOpen, 
  Package
} from 'lucide-react';
import sdkData from '../data/sdk-data.json';
import { SDKLanguage, SDKData } from '../types/sdk';
// Import our smaller, focused components instead of writing everything here
import { WhatIsSDK } from '../components/sdk/WhatIsSDK';
import { SDKIntegrationTab } from '../components/sdk/SDKIntegrationTab';
import { APIReference } from '../components/sdk/APIReference';

/**
 * Main SDK Integration Page Component
 * 
 * This component acts as a "container" that:
 * 1. Manages the overall page state (which tab is active, what language is selected)
 * 2. Handles shared functionality (like copying code to clipboard)
 * 3. Renders the appropriate child component based on the active tab
 * 
 * BEST PRACTICE: Keep parent components simple. They should coordinate,
 * not do all the work themselves. This is called "separation of concerns".
 */
export const SDKIntegrationPage: React.FC = () => {
  // Convert the JSON data to TypeScript type for better type safety
  // This helps catch errors before the code runs
  const typedSdkData = sdkData as SDKData;
  
  /**
   * STATE MANAGEMENT - Best Practices:
   * 
   * useState: Used to store data that can change and needs to update the UI.
   * When state changes, React automatically re-renders the component.
   * 
   * Why we initialize with the first language:
   * - Users need something selected by default
   * - Prevents "undefined" errors
   * - Better user experience (no empty state)
   */
  const [selectedLanguage, setSelectedLanguage] = useState<SDKLanguage>(typedSdkData.languages[0]);
  
  // Track which code snippet was just copied (to show checkmark icon)
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  // Track which tab the user is viewing (What is SDK? / SDK Integration / API Reference)
  const [activeTab, setActiveTab] = useState<'sdk' | 'what-is-sdk' | 'api'>('sdk');
  
  // Get wallet connection status from our custom hook
  // BEST PRACTICE: Use custom hooks to share logic between components
  const { connectedWallets } = useBuiltInWallet();
  
  // Change theme based on wallet connection (cyberpunk theme when wallet connected)
  const theme = connectedWallets.length > 0 ? 'cyberpunk' : 'modern';

  /**
   * COPY TO CLIPBOARD FUNCTION - Best Practices:
   * 
   * useCallback: Wraps a function so it doesn't get recreated on every render.
   * This is important because:
   * - Prevents unnecessary re-renders of child components
   * - Improves performance (especially with many child components)
   * - The empty array [] means "never recreate this function"
   * 
   * Error Handling: Always wrap risky operations (like clipboard access) in try/catch
   * or use .catch() to handle errors gracefully without crashing the app.
   * 
   * Cleanup: The return function clears the timeout if the component unmounts.
   * This prevents memory leaks (like timers running after component is gone).
   */
  const handleCopyCode = useCallback((code: string, id: string) => {
    // Try to copy code to clipboard
    navigator.clipboard.writeText(code).catch((error) => {
      // If it fails (e.g., user denied permission), log error but don't crash
      // Note: logger not imported as this page is commented out in routes
      // eslint-disable-next-line no-console
      console.error('Failed to copy code:', error);
    });
    
    // Show checkmark icon for 2 seconds
    setCopiedCode(id);
    const timeoutId = setTimeout(() => setCopiedCode(null), 2000);
    
    // Cleanup function: clear timeout if component unmounts before 2 seconds
    return () => clearTimeout(timeoutId);
  }, []); // Empty array = function never changes

  /**
   * RENDER - Best Practices:
   * 
   * Conditional Styling: We use template literals (backticks) with ternary operators
   * to apply different CSS classes based on the theme. This is cleaner than
   * writing separate components for each theme.
   * 
   * Component Composition: Instead of writing all the content here, we render
   * smaller components (<WhatIsSDK />, <SDKIntegrationTab />, etc.). This is called
   * "component composition" - building complex UIs from simple pieces.
   */
  return (
    <div className={`min-h-screen transition-all duration-500 ${
      theme === 'cyberpunk' 
        ? 'cyberpunk-theme' 
        : 'bg-secondary-50'
    }`}>
      {/* 
        HERO SECTION - Best Practice:
        The hero section is kept in the main component because it's unique to this page.
        If it were reusable elsewhere, we'd extract it to its own component.
      */}
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
              {theme === 'cyberpunk' ? 'BIT SDK & API DOCUMENTATION' : 'Bit SDK & API Documentation'}
            </h1>
            <p className={`text-xl mb-8 transition-all duration-300 ${
              theme === 'cyberpunk' 
                ? 'text-white/90 cyberpunk-font' 
                : 'text-white/90'
            }`}>
              {theme === 'cyberpunk' 
                ? 'Everything you need to integrate bitAI and Web3 features into your applications' 
                : 'Everything you need to integrate bitAI and Web3 features into your applications'}
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
                <Package className="w-4 h-4" />
                <span>v{sdkData.version}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-12">
        {/* 
          TAB NAVIGATION - Best Practice:
          Tabs are kept here because they control which child component to show.
          This is a common pattern: parent controls navigation, children handle content.
        */}
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

        {/* 
          CONDITIONAL RENDERING - Best Practice:
          
          We only render the component for the active tab. This is called "conditional rendering".
          
          Why this is better than showing/hiding with CSS:
          - Unmounted components don't use memory
          - Better performance (React doesn't process hidden components)
          - Cleaner code (no need to manage visibility state)
          
          PROPS PASSING - Best Practice:
          We pass data and functions down to child components as "props".
          This is called "unidirectional data flow" - data flows down, events flow up.
          
          - sdkData: The data the child needs
          - selectedLanguage: Current selection (state from parent)
          - onLanguageSelect: Function to update selection (parent controls state)
          - onCopyCode: Shared copy function (reusable across tabs)
          - copiedCode: Which code was copied (for visual feedback)
        */}
        {activeTab === 'what-is-sdk' && <WhatIsSDK />}
        
        {activeTab === 'sdk' && (
          <SDKIntegrationTab
            sdkData={typedSdkData}
            selectedLanguage={selectedLanguage}
            onLanguageSelect={setSelectedLanguage}
            onCopyCode={handleCopyCode}
            copiedCode={copiedCode}
          />
        )}

        {activeTab === 'api' && (
          <APIReference
            onCopyCode={handleCopyCode}
            copiedCode={copiedCode}
          />
        )}
      </div>
    </div>
  );
};

export default SDKIntegrationPage;
