/**
 * Sidebar Navigation Component
 * 
 * Collapsible sidebar navigation with:
 * - Expandable/collapsible state
 * - Active route highlighting
 * - Theme-aware styling (cyberpunk/modern)
 * - MVP focus: Only Chat navigation active
 * 
 * Currently configured for MVP with only ChatPage navigation visible.
 * Other navigation items are commented out and can be enabled as pages are activated.
 */
import React, { useState, useMemo, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { useBuiltInWallet } from '../../hooks/useBuiltInWallet';
import { useTheme } from '../../hooks/useTheme';
import { 
  Home,
  MessageSquare,
  // Store, // Non-MVP
  // HelpCircle, // Non-MVP
  Zap,
  Shield,
  Globe,
  // Code, // Non-MVP
  // Book // Non-MVP
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

// LANDING PAGE FOCUS: Only Chat navigation active - all other pages commented out
// This simplifies navigation to focus on the core chat experience
const navigation: NavItem[] = [
  { name: 'AI Chat', href: '/chat', icon: MessageSquare, badge: 'New' },
  // All other navigation items commented out - uncomment as pages are enabled
  // { name: 'Home', href: '/home', icon: Home },
  // { name: 'bitVault', href: '/vault', icon: Shield },
  // { name: 'bitAppStore', href: '/bit-store', icon: Store },
];

// Non-MVP Navigation - Commented out
// const developer: NavItem[] = [
//   { name: 'Developer Portal', href: '/developer', icon: Code },
//   { name: 'SDK & API Docs', href: '/sdk', icon: Book },
// ];

// const tools: NavItem[] = [
//   { name: 'Help & Support', href: '/help', icon: HelpCircle },
// ];

interface SidebarProps {
  onExpandedChange?: (expanded: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = React.memo(({ onExpandedChange }) => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const { isCyberpunk } = useTheme();

  const handleExpandedChange = useCallback((expanded: boolean) => {
    setIsExpanded(expanded);
    onExpandedChange?.(expanded);
  }, [onExpandedChange]);

  const NavItem: React.FC<{ item: NavItem }> = ({ item }) => {
    const isActive = location.pathname === item.href;
    
    return (
      <Link
        to={item.href}
        className={cn(
          'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200',
          isCyberpunk 
            ? (isActive 
                ? 'cyberpunk-gradient-bg text-white border-r-2 border-green-400 cyberpunk-font' 
                : 'text-white/80 hover:bg-green-500/20 hover:text-white cyberpunk-font')
            : (isActive 
                ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600' 
                : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900')
        )}
        title={item.name} // Tooltip for collapsed state
      >
        <item.icon className={cn(
          'transition-all duration-200',
          isCyberpunk 
            ? (isActive 
                ? 'text-white' 
                : 'text-white/60')
            : (isActive 
                ? 'text-primary-600' 
                : 'text-secondary-400'),
          {
            'mr-3 h-6 w-6': isExpanded,
            'mx-auto h-20 w-20': !isExpanded,
          }
        )} />
        {isExpanded && (
          <>
            <span className={`flex-1 ${
              isCyberpunk 
                ? 'cyberpunk-font' 
                : ''
            }`}>{item.name}</span>
            {item.badge && (
              <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                isCyberpunk 
                  ? 'bg-green-500/20 text-green-400 cyberpunk-font' 
                  : 'bg-primary-100 text-primary-700'
              }`}>
                {item.badge}
              </span>
            )}
          </>
        )}
      </Link>
    );
  };

  return (
    <div 
      className={cn(
        'sidebar-container fixed inset-y-0 left-0 border-r shadow-sm z-10 transition-all duration-300',
        'transform-gpu will-change-transform', // Optimize for GPU rendering
        isExpanded ? 'w-64' : 'w-20',
        isCyberpunk 
          ? 'cyberpunk-card border-green-400/30' 
          : 'bg-white border-secondary-200'
      )}
      onMouseEnter={() => handleExpandedChange(true)}
      onMouseLeave={() => handleExpandedChange(false)}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className={`flex items-center px-6 py-4 border-b transition-all duration-300 ${
          isCyberpunk 
            ? 'border-green-400/30' 
            : 'border-secondary-200'
        }`}>
          <div className={cn(
            'rounded-lg flex items-center justify-center shadow-glow transition-all duration-200',
            isExpanded ? 'w-10 h-10' : 'w-8 h-8',
            isCyberpunk 
              ? 'cyberpunk-gradient-bg' 
              : 'blue-purple-logo-gradient'
          )}>
            <Zap className={cn(
              'text-white transition-all duration-200',
              isExpanded ? 'w-6 h-6' : 'w-5 h-5'
            )} />
          </div>
          {isExpanded && (
            <span className="ml-2 text-xl font-bold text-gradient bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              bitPorta
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          <div className="space-y-1">
            {navigation.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </div>

          {/* Non-MVP Sections - Commented out */}
          {/* 
          <div className={`border-t my-4 transition-all duration-300 ${
            isCyberpunk 
              ? 'border-green-400/30' 
              : 'border-secondary-200'
          }`}></div>

          <div className="space-y-1">
            {isExpanded && (
              <h3 className={`px-3 text-xs font-semibold uppercase tracking-wider ${
                isCyberpunk 
                  ? 'text-green-400 cyberpunk-font' 
                  : 'text-secondary-500'
              }`}>
                {isCyberpunk ? 'SAFE MODULES' : 'Developer'}
              </h3>
            )}
            {developer.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </div>

          <div className="border-t border-secondary-200 my-4"></div>

          <div className="space-y-1">
            {isExpanded && (
              <h3 className="px-3 text-xs font-semibold text-secondary-500 uppercase tracking-wider">
                Tools
              </h3>
            )}
            {tools.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </div>
          */}
        </nav>

        {/* Footer */}
        <div className={cn(
          'p-4 border-t transition-all duration-200',
          isCyberpunk 
            ? 'border-green-400/30' 
            : 'border-secondary-200'
        )}>
          <div className={cn(
            'flex items-center p-3 rounded-lg transition-all duration-200',
            isExpanded ? 'space-x-3' : 'justify-center',
            isCyberpunk 
              ? 'bg-green-500/10' 
              : 'bg-secondary-50'
          )}>
            <div className={cn(
              'rounded-full flex items-center justify-center transition-all duration-200',
              isExpanded ? 'w-8 h-8' : 'w-12 h-12',
              isCyberpunk 
                ? 'cyberpunk-gradient-bg' 
                : 'bg-primary-100'
            )}>
              <MessageSquare className={cn(
                'transition-all duration-200',
                isExpanded ? 'w-4 h-4' : 'w-6 h-6',
                isCyberpunk 
                  ? 'text-white' 
                  : 'text-primary-600'
              )} />
            </div>
            {isExpanded && (
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${
                  isCyberpunk 
                    ? 'text-white cyberpunk-font' 
                    : 'text-secondary-900'
                }`}>
                  {isCyberpunk ? 'BIT AI ASSISTANT' : 'bitAI Assistant'}
                </p>
                <p className={`text-xs truncate ${
                  isCyberpunk 
                    ? 'text-white/70 cyberpunk-font' 
                    : 'text-secondary-500'
                }`}>
                  {isCyberpunk 
                    ? 'Your Web3 AI companion' 
                    : 'Your Web3 AI assistant'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

Sidebar.displayName = 'Sidebar';
