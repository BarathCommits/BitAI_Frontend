/**
 * Main Application Component
 * 
 * This is the root component that sets up routing, authentication, and global app state.
 * Currently configured for MVP with only ChatPage active - all other pages are commented out.
 * 
 * Architecture:
 * - Lazy loading: All pages are lazy-loaded for better performance
 * - Error boundaries: Each route is wrapped in ErrorBoundary for error handling
 * - Code splitting: Pages are split into separate chunks
 * - State management: Uses Zustand for wallet state, React Query for server state
 */
import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
// Music Player - Commented out as audio file removed (can be re-enabled when audio is added)
// import { MusicPlayer } from './components/MusicPlayer';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { authService } from './services/AuthService';
import { initializeChunkErrorHandling } from './utils/chunkErrorHandler';
import { useWalletStore } from './store/walletStore';
import { useTheme } from './hooks/useTheme';
import { analyticsService } from './services/AnalyticsService';
import { useLocation } from 'react-router-dom';

// Code splitting: Lazy load all pages for better performance
// 
// LANDING PAGE FOCUS: Only ChatPage is active - all other pages commented out
// This simplifies the app to focus on the core chat experience

// Active Page - Chat Page (Landing Page)
const ChatPage = lazy(() => import('./pages/ChatPage').then(m => ({ default: m.ChatPage })));

// All other pages commented out - to be enabled as needed
// const HomePage = lazy(() => import('./pages/HomePage'));
// const VaultPage = lazy(() => import('./pages/VaultPage'));
// const BitStorePage = lazy(() => import('./pages/BitStorePage'));
// const SDKIntegrationPage = lazy(() => import('./pages/SDKIntegrationPage'));
// const DeveloperDashboardPage = lazy(() => import('./pages/DeveloperDashboardPage'));
// const SDKSubmitPage = lazy(() => import('./pages/SDKSubmitPage'));
// const HelpSupportPage = lazy(() => import('./pages/HelpSupportPage'));
// const PortfolioPage = lazy(() => import('./pages/PortfolioPage'));
// const SettingsPage = lazy(() => import('./pages/SettingsPage'));
// const DashboardPage = lazy(() => import('./pages/DashboardPage'));
// const ComplianceVerificationPage = lazy(() => import('./pages/ComplianceVerificationPage'));

// Page View Tracker Component
function PageViewTracker() {
  const location = useLocation();

  useEffect(() => {
    const pageName = location.pathname.replace('/', '') || 'home';
    analyticsService.trackPageView(pageName, {
      path: location.pathname,
      search: location.search,
    });
    analyticsService.trackActivity({
      activityType: 'page_view',
      details: {
        page: pageName,
        path: location.pathname,
      },
    });
  }, [location]);

  return null;
}

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
      {/* Global Music Player - Commented out as audio file removed (can be re-enabled when audio is added) */}
      {/* <MusicPlayer isEnabled={isWalletConnected} /> */}
      
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
        <PageViewTracker />
        <Routes>
          {/* 
            LANDING PAGE: Redirect root path to chat page
            This makes /chat the default landing page when users visit the app
          */}
          <Route path="/" element={<Navigate to="/chat" replace />} />
          
          {/* 
            ACTIVE ROUTE: Chat Page (Landing Page)
            This is the only active page - all other routes are commented out below
          */}
          <Route path="/chat" element={
            <ErrorBoundary>
              <Layout>
                <ChatPage />
              </Layout>
            </ErrorBoundary>
          } />
          
          {/* 
            ============================================
            ALL OTHER ROUTES COMMENTED OUT
            ============================================
            Uncomment routes below as needed when ready to enable those pages
          */}
          
          {/* Home Page - Commented out */}
          {/* 
          <Route path="/home" element={
            <ErrorBoundary>
              <Layout>
                <HomePage />
              </Layout>
            </ErrorBoundary>
          } />
          */}
          
          {/* Vault Page - Commented out */}
          {/* 
          <Route path="/vault" element={
            <ErrorBoundary>
              <Layout>
                <VaultPage />
              </Layout>
            </ErrorBoundary>
          } />
          */}
          
          {/* Bit Store Page - Commented out */}
          {/* 
          <Route path="/bit-store" element={
            <ErrorBoundary>
              <Layout>
                <BitStorePage />
              </Layout>
            </ErrorBoundary>
          } />
          */}
          
          {/* Developer Dashboard - Commented out */}
          {/* 
          <Route path="/developer" element={
            <ErrorBoundary>
              <Layout>
                <DeveloperDashboardPage />
              </Layout>
            </ErrorBoundary>
          } />
          */}
          
          {/* SDK Submit Page - Commented out */}
          {/* 
          <Route path="/developer/submit" element={
            <ErrorBoundary>
              <Layout>
                <SDKSubmitPage />
              </Layout>
            </ErrorBoundary>
          } />
          */}
          
          {/* SDK Integration Page - Commented out */}
          {/* 
          <Route path="/sdk" element={
            <ErrorBoundary>
              <Layout>
                <SDKIntegrationPage />
              </Layout>
            </ErrorBoundary>
          } />
          */}
          
          {/* Help & Support Page - Commented out */}
          {/* 
          <Route path="/help" element={
            <ErrorBoundary>
              <Layout>
                <HelpSupportPage />
              </Layout>
            </ErrorBoundary>
          } />
          */}
          
          {/* Portfolio Page - Commented out */}
          {/* 
          <Route path="/portfolio" element={
            <ErrorBoundary>
              <Layout>
                <PortfolioPage />
              </Layout>
            </ErrorBoundary>
          } />
          */}
          
          {/* Settings Page - Commented out */}
          {/* 
          <Route path="/settings" element={
            <ErrorBoundary>
              <Layout>
                <SettingsPage />
              </Layout>
            </ErrorBoundary>
          } />
          */}
          
          {/* Dashboard Page - Commented out */}
          {/* 
          <Route path="/dashboard" element={
            <ErrorBoundary>
              <Layout>
                <DashboardPage />
              </Layout>
            </ErrorBoundary>
          } />
          */}
          
          {/* Compliance Verification Page - Commented out */}
          {/* 
          <Route path="/compliance" element={
            <ErrorBoundary>
              <Layout>
                <ComplianceVerificationPage />
              </Layout>
            </ErrorBoundary>
          } />
          */}
          
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
