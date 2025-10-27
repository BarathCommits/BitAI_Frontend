import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import './index.css';
import App from './App';
import { setupAuthInterceptor, validateSession } from './utils/apiInterceptor';
import { isValidWalletToken, clearAuthAndReconnect } from './utils/authDebugger';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Initialize authentication interceptor and validate session
setupAuthInterceptor();
validateSession();

// Check if token is valid for wallet-based auth
const tokenCheck = isValidWalletToken();
if (!tokenCheck.valid && localStorage.getItem('jwtToken')) {
  console.error('❌ Invalid wallet token detected:', tokenCheck.reason);
  console.log('🔧 Automatically clearing old auth data...');
  
  // Clear old token and redirect to auth
  clearAuthAndReconnect();
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #334155',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#f8fafc',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#f8fafc',
              },
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
