import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { useBuiltInWallet } from '../../hooks/useBuiltInWallet';
import { useTheme } from '../../hooks/useTheme';
import { 
  Home,
  MessageSquare,
  Store,
  HelpCircle,
  Zap,
  Shield,
  Globe,
  Code,
  Book
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navigation: NavItem[] = [
  { name: 'AI Chat', href: '/', icon: MessageSquare, badge: 'New' },
  { name: 'Home', href: '/home', icon: Home },
  { name: 'Bit AppStore', href: '/safe-store', icon: Store },
  { name: 'Bit Vault', href: '/vault', icon: Shield },
];

const developer: NavItem[] = [
  { name: 'Developer Portal', href: '/developer', icon: Code },
  { name: 'SDK & API Docs', href: '/sdk', icon: Book },
];

const tools: NavItem[] = [
  { name: 'Help & Support', href: '/help', icon: HelpCircle },
];

interface SidebarProps {
  onExpandedChange?: (expanded: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onExpandedChange }) => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const { isCyberpunk } = useTheme();

  const handleExpandedChange = (expanded: boolean) => {
    setIsExpanded(expanded);
    onExpandedChange?.(expanded);
  };

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
              Bit
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

          {/* Divider */}
          <div className={`border-t my-4 transition-all duration-300 ${
            isCyberpunk 
              ? 'border-green-400/30' 
              : 'border-secondary-200'
          }`}></div>

          {/* Developer */}
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

          {/* Divider */}
          <div className="border-t border-secondary-200 my-4"></div>

          {/* Tools */}
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
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-secondary-200">
          <div className={cn(
            'flex items-center p-3 bg-secondary-50 rounded-lg transition-all duration-200',
            isExpanded ? 'space-x-3' : 'justify-center'
          )}>
            <div className={cn(
              'bg-primary-100 rounded-full flex items-center justify-center transition-all duration-200',
              isExpanded ? 'w-8 h-8' : 'w-12 h-12'
            )}>
              <Globe className={cn(
                'text-primary-600 transition-all duration-200',
                isExpanded ? 'w-4 h-4' : 'w-6 h-6'
              )} />
            </div>
            {isExpanded && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-secondary-900">
                  Web3 Explorer
                </p>
                <p className="text-xs text-secondary-500 truncate">
                  Discover the decentralized web
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
