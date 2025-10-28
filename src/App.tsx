/* eslint-disable */
import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { authService } from './services/AuthService';
import { initializeChunkErrorHandling } from './utils/chunkErrorHandler';
import { useWalletStore } from './store/walletStore';
import { useTheme } from './hooks/useTheme';

// Code splitting: Lazy load all pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const SafeStorePage = lazy(() => import('./pages/SafeStorePage'));
const ChatPage = lazy(() => import('./pages/ChatPage').then(m => ({ default: m.ChatPage })));
const VaultPage = lazy(() => import('./pages/VaultPage'));
const SDKIntegrationPage = lazy(() => import('./pages/SDKIntegrationPage'));
const DeveloperDashboardPage = lazy(() => import('./pages/DeveloperDashboardPage'));
const SDKSubmitPage = lazy(() => import('./pages/SDKSubmitPage'));
const HelpSupportPage = lazy(() => import('./pages/HelpSupportPage'));

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [walletExtensionsLoaded, setWalletExtensionsLoaded] = useState(false);
  
  // Get wallet store actions and state
  const { initializeWalletState, isLoading: walletLoading, isConnected, connectedWallets } = useWalletStore();
  
  // Initialize theme with wallet connection status
  const isWalletConnected = isConnected || connectedWallets.length > 0;
  useTheme(isWalletConnected);

  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  // Initialize chunk error handling
  useEffect(() => {
    initializeChunkErrorHandling();
  }, []);

  // Initialize authentication and wallet service on app startup
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check authentication status
        const authStatus = authService.isAuthenticated();
        setIsAuthenticated(authStatus);
        
        // Initialize wallet service
        // The unified wallet service initializes automatically
        setWalletExtensionsLoaded(true);
        
        // Initialize wallet state (restore from storage)
        await initializeWalletState();
        
      } catch (error) {
        setWalletExtensionsLoaded(true); // Continue anyway
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [initializeWalletState]);

  if (isLoading || walletLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-white text-lg">
            {walletExtensionsLoaded ? (walletLoading ? 'Restoring wallet connection...' : 'Loading Bit...') : 'Initializing wallet service...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <React.Fragment>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center gradient-bg">
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-white text-lg">Loading Bit...</p>
            </div>
          </div>
        }
      >
        <Routes>
          {/* Redirect root to chat */}
          <Route path="/" element={<Navigate to="/chat" replace />} />
          
          {/* Main application routes */}
          <Route path="/chat" element={
            <ErrorBoundary>
              <Layout>
                <ChatPage />
              </Layout>
            </ErrorBoundary>
          } />
          
          <Route path="/home" element={
            <ErrorBoundary>
              <Layout>
                <HomePage />
              </Layout>
            </ErrorBoundary>
          } />
          
          <Route path="/vault" element={
            <ErrorBoundary>
              <Layout>
                <VaultPage />
              </Layout>
            </ErrorBoundary>
          } />
          
          <Route path="/safe-store" element={
            <ErrorBoundary>
              <Layout>
                <SafeStorePage />
              </Layout>
            </ErrorBoundary>
          } />
          
          <Route path="/developer" element={
            <ErrorBoundary>
              <Layout>
                <DeveloperDashboardPage />
              </Layout>
            </ErrorBoundary>
          } />
          
          <Route path="/developer/submit" element={
            <ErrorBoundary>
              <Layout>
                <SDKSubmitPage />
              </Layout>
            </ErrorBoundary>
          } />
          
          <Route path="/sdk" element={
            <ErrorBoundary>
              <Layout>
                <SDKIntegrationPage />
              </Layout>
            </ErrorBoundary>
          } />
          
          <Route path="/help" element={
            <ErrorBoundary>
              <Layout>
                <HelpSupportPage />
              </Layout>
            </ErrorBoundary>
          } />
          
          {/* Catch all route */}
          <Route path="*" element={
            <ErrorBoundary>
              <Layout>
                <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-gray-50">
                  <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Page Not Found</h2>
                    <p className="text-gray-600 mb-4">The page you're looking for could not be found.</p>
                    <a
                      href="/chat"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Go to Chat
                    </a>
                  </div>
                </div>
              </Layout>
            </ErrorBoundary>
          } />
        </Routes>
      </Suspense>
    </React.Fragment>
  );
}

export default App;
