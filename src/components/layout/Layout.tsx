/**
 * Layout Component
 * 
 * Main application layout wrapper that provides:
 * - Header (always visible)
 * - Sidebar (optional, collapsible)
 * - Footer (optional, can be enabled/disabled)
 * - Theme-aware styling (cyberpunk/modern)
 * - Responsive layout adjustments
 * 
 * This is the root layout component used by all pages.
 */
import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { cn } from '../../utils/cn';
// import { useBuiltInWallet } from '../../hooks/useBuiltInWallet'; // Commented out for MVP - to be released later
import { useTheme } from '../../hooks/useTheme';

export interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  showFooter?: boolean;
  className?: string;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  showSidebar = true,
  showFooter = true,
  className,
}) => {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  
  // Use unified theme system
  const { isCyberpunk } = useTheme();

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isCyberpunk 
        ? 'cyberpunk-theme' 
        : 'bg-secondary-50'
    }`}>
      <Header />
      
      <div className="flex">
        {showSidebar && (
          <Sidebar 
            onExpandedChange={setSidebarExpanded}
          />
        )}
        
        <main className={cn(
          'flex-1 min-h-screen transition-all duration-300',
          {
            'ml-20': showSidebar && !sidebarExpanded, // Collapsed sidebar width (80px for large icons)
            'ml-64': showSidebar && sidebarExpanded, // Expanded sidebar width
          },
          className
        )}>
          {children}
        </main>
      </div>
      
      {/* Footer - Enabled */}
      {showFooter && <Footer />}
    </div>
  );
};
