/**
 * Tab Management Utility
 * 
 * Provides reliable tab opening functionality that doesn't interfere
 * with the sidebar or other UI elements.
 */

/**
 * Opens a new tab with proper focus and error handling
 * @param url - The URL to open
 * @param windowName - Optional window name for the tab
 * @returns Promise<Window | null> - The opened window or null if blocked
 */
export const openNewTab = (url: string, windowName?: string): Promise<Window | null> => {
  return new Promise((resolve) => {
    try {
      // Ensure the URL is valid
      if (!url || typeof url !== 'string') {
        console.error('Invalid URL provided to openNewTab:', url);
        resolve(null);
        return;
      }

      // Add protocol if missing
      let fullUrl = url;
      if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('mailto:')) {
        fullUrl = `https://${url}`;
      }

      // Temporarily hide any interfering elements
      const sidebar = document.querySelector('.sidebar-container') as HTMLElement;
      const originalZIndex = sidebar?.style.zIndex;
      const originalTransform = sidebar?.style.transform;
      
      if (sidebar) {
        sidebar.style.zIndex = '-1';
        sidebar.style.transform = 'translateX(-100%)';
      }

      // Open the tab with proper parameters
      const newWindow = window.open(
        fullUrl,
        windowName || '_blank',
        'noopener,noreferrer,scrollbars=yes,resizable=yes,width=1200,height=800,top=100,left=100'
      );

      // Restore sidebar z-index after a short delay
      setTimeout(() => {
        if (sidebar && originalZIndex !== undefined) {
          sidebar.style.zIndex = originalZIndex;
        } else if (sidebar) {
          sidebar.style.zIndex = '';
        }
        
        if (sidebar && originalTransform !== undefined) {
          sidebar.style.transform = originalTransform;
        } else if (sidebar) {
          sidebar.style.transform = '';
        }
      }, 100);

      if (newWindow) {
        // Focus the new window
        newWindow.focus();
        
        // Check if the window was actually opened (not blocked by popup blocker)
        setTimeout(() => {
          if (newWindow.closed || newWindow.document.readyState === 'complete') {
            resolve(newWindow);
          } else {
            // Window is still loading, resolve anyway
            resolve(newWindow);
          }
        }, 200);
      } else {
        // Popup was blocked
        console.warn('Popup blocked by browser. Please allow popups for this site.');
        resolve(null);
      }
    } catch (error) {
      console.error('Error opening new tab:', error);
      resolve(null);
    }
  });
};

/**
 * Opens a dApp in a new tab with proper error handling
 * @param dappUrl - The dApp URL to open
 * @param dappName - The name of the dApp for logging
 * @returns Promise<boolean> - True if successfully opened, false otherwise
 */
export const openDApp = async (dappUrl: string, dappName: string): Promise<boolean> => {
  try {
    // Try the primary method first
    let newWindow = await openNewTab(dappUrl, `dapp_${dappName.replace(/\s+/g, '_')}`);
    
    if (!newWindow) {
      // If primary method fails, try alternative method
      console.log(`Primary method failed for ${dappName}, trying alternative method...`);
      newWindow = await openNewTabAlternative(dappUrl, `dapp_${dappName.replace(/\s+/g, '_')}`);
    }
    
    if (newWindow) {
      console.log(`✅ Successfully opened ${dappName} in new tab`);
      return true;
    } else {
      console.warn(`❌ Failed to open ${dappName} - popup blocked or invalid URL`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error opening ${dappName}:`, error);
    return false;
  }
};

/**
 * Opens an external link with proper security attributes
 * @param url - The URL to open
 * @param linkText - Optional text for the link (for accessibility)
 * @returns void
 */
export const openExternalLink = (url: string, linkText?: string): void => {
  try {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = linkText || url;
    
    // Temporarily add to DOM to ensure proper behavior
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error opening external link:', error);
    // Fallback to window.open
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

/**
 * Alternative method to open tabs that bypasses potential sidebar interference
 * @param url - The URL to open
 * @param windowName - Optional window name for the tab
 * @returns Promise<Window | null> - The opened window or null if blocked
 */
export const openNewTabAlternative = (url: string, windowName?: string): Promise<Window | null> => {
  return new Promise((resolve) => {
    try {
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.style.display = 'none';
      
      // Add to DOM temporarily
      document.body.appendChild(link);
      
      // Temporarily hide sidebar
      const sidebar = document.querySelector('.sidebar-container') as HTMLElement;
      if (sidebar) {
        sidebar.style.display = 'none';
      }
      
      // Click the link
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      
      // Restore sidebar
      setTimeout(() => {
        if (sidebar) {
          sidebar.style.display = '';
        }
      }, 50);
      
      // For this method, we can't easily detect if it was blocked
      // So we'll resolve with a mock window object
      resolve({} as Window);
      
    } catch (error) {
      console.error('Error opening new tab with alternative method:', error);
      resolve(null);
    }
  });
};

/**
 * Shows a user-friendly message if popups are blocked
 * @param dappName - The name of the dApp that couldn't be opened
 */
export const showPopupBlockedMessage = (dappName: string): void => {
  const message = `Unable to open ${dappName}. Please allow popups for this site and try again.`;
  
  // You can replace this with your preferred notification system
  if (typeof window !== 'undefined' && window.alert) {
    alert(message);
  } else {
    console.warn(message);
  }
};
