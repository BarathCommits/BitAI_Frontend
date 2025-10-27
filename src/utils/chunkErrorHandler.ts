/**
 * Chunk Error Handler Utility
 * 
 * This utility provides graceful handling of chunk loading errors,
 * particularly for lucide-react icons and other dynamic imports.
 */

// Global chunk loading error handler
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (event.error && event.error.name === 'ChunkLoadError') {
      console.warn('Chunk loading error detected:', event.error);
      
      // Attempt to reload the page to recover from chunk loading errors
      if (event.error.message.includes('chunk') || event.error.message.includes('vendors')) {
        console.log('Attempting to reload page to recover from chunk loading error...');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    }
  });

  // Handle unhandled promise rejections for chunk loading
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.name === 'ChunkLoadError') {
      console.warn('Unhandled chunk loading error:', event.reason);
      event.preventDefault(); // Prevent the error from being logged to console
      
      // Attempt to reload the page
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  });
}

/**
 * Safe icon import function
 * Provides a fallback mechanism for lucide-react icons
 */
export const safeIconImport = async (iconName: string) => {
  try {
    const lucideModule = await import('lucide-react');
    const Icon = (lucideModule as any)[iconName];
    return Icon;
  } catch (error) {
    console.warn(`Failed to load icon ${iconName}:`, error);
    
    // Return a fallback icon (a simple div with text)
    return ({ className, ...props }: any) => {
      const div = document.createElement('div');
      div.className = `flex items-center justify-center bg-gray-200 text-gray-600 text-xs ${className || ''}`;
      div.textContent = '?';
      return div;
    };
  }
};

/**
 * Retry mechanism for failed chunk loads
 */
export const retryChunkLoad = (retryCount = 3): Promise<void> => {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    const attemptLoad = () => {
      attempts++;
      
      if (attempts > retryCount) {
        reject(new Error(`Failed to load chunk after ${retryCount} attempts`));
        return;
      }
      
      // Force reload the page as a last resort
      if (attempts === retryCount) {
        console.log('Final attempt: reloading page...');
        window.location.reload();
        return;
      }
      
      // Wait before retrying
      setTimeout(() => {
        attemptLoad();
      }, 1000 * attempts);
    };
    
    attemptLoad();
  });
};

/**
 * Initialize chunk error handling
 * Call this in your main App component
 */
export const initializeChunkErrorHandling = () => {
  if (typeof window === 'undefined') return;
  
  // Override the webpack chunk loading function
  const originalChunkLoad = (window as any).__webpack_require__?.e;
  
  if (originalChunkLoad) {
    (window as any).__webpack_require__.e = function(chunkId: string) {
      return originalChunkLoad.call(this, chunkId).catch((error: any) => {
        console.warn(`Chunk loading failed for ${chunkId}:`, error);
        
        // Retry the chunk load
        return retryChunkLoad().then(() => {
          return originalChunkLoad.call(this, chunkId);
        });
      });
    };
  }
};
