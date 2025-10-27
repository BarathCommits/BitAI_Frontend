import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Edit, 
  Trash2, 
  Copy,
  Check,
  CreditCard,
  User,
  FileText,
  Shield,
  Lock,
  Star
} from 'lucide-react';
import { PersonalInfo } from '../../types';
import { cn } from '../../utils/cn';
import { useBuiltInWallet } from '../../hooks/useBuiltInWallet';

interface VaultItemCardProps {
  item: PersonalInfo;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isVisible: boolean;
  onToggleVisibility: (id: string) => void;
}

const getItemIcon = (type: string) => {
  switch (type) {
    case 'credit_card':
      return CreditCard;
    case 'id_card':
      return User;
    case 'passport':
      return Shield;
    case 'license':
      return FileText;
    default:
      return Lock;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'personal':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'financial':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'identity':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'documents':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

export const VaultItemCard: React.FC<VaultItemCardProps> = ({
  item,
  onEdit,
  onDelete,
  isVisible,
  onToggleVisibility,
}) => {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { connectedWallets } = useBuiltInWallet();
  const theme = connectedWallets.length > 0 ? 'cyberpunk' : 'modern';
  const Icon = getItemIcon(item.type);

  const handleCopy = () => {
    navigator.clipboard.writeText(item.value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`group rounded-xl border transition-all duration-200 overflow-hidden ${
        theme === 'cyberpunk' 
          ? 'cyberpunk-card border-green-400/30 hover:border-green-400/50' 
          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
      }`}
    >
      {/* Card Content */}
      <div className="p-5">
        <div className="flex items-start justify-between">
          {/* Icon and Info */}
          <div className="flex items-start gap-4 flex-1 min-w-0">
            {/* Icon */}
            <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
              theme === 'cyberpunk' 
                ? 'cyberpunk-gradient-bg' 
                : 'bg-gradient-to-br from-primary-50 to-primary-100'
            }`}>
              <Icon className={`w-6 h-6 transition-all duration-300 ${
                theme === 'cyberpunk' 
                  ? 'text-white' 
                  : 'text-primary-600'
              }`} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Label and Category */}
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`text-base font-semibold truncate transition-all duration-300 ${
                  theme === 'cyberpunk' 
                    ? 'text-white cyberpunk-font' 
                    : 'text-gray-900'
                }`}>
                  {item.label || item.title}
                </h3>
                {item.metadata?.isStarred && (
                  <Star className={`w-4 h-4 flex-shrink-0 transition-all duration-300 ${
                    theme === 'cyberpunk' 
                      ? 'text-yellow-400 fill-yellow-400' 
                      : 'text-yellow-500 fill-yellow-500'
                  }`} />
                )}
              </div>

              {/* Category Badge */}
              <div className="flex items-center gap-2 mb-3">
                <span className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border transition-all duration-300',
                  theme === 'cyberpunk' 
                    ? 'bg-green-500/20 text-green-400 border-green-400/50 cyberpunk-font' 
                    : getCategoryColor(item.category)
                )}>
                  {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                </span>
                <span className={`text-xs transition-all duration-300 ${
                  theme === 'cyberpunk' 
                    ? 'text-white/60 cyberpunk-font' 
                    : 'text-gray-500'
                }`}>
                  {item.type.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              {/* Value */}
              <div className="flex items-center gap-2">
                <code className={cn(
                  'text-sm px-3 py-1.5 rounded-lg font-mono transition-all duration-300',
                  theme === 'cyberpunk' 
                    ? (isVisible 
                        ? 'bg-green-500/20 text-white border border-green-400/30' 
                        : 'bg-gray-500/20 text-white/40')
                    : (isVisible 
                        ? 'bg-gray-50 text-gray-900 border border-gray-200' 
                        : 'bg-gray-100 text-gray-400')
                )}>
                  {isVisible ? item.value : '••••••••••••'}
                </code>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className={cn(
            'flex items-center gap-1 transition-opacity duration-200',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}>
            {/* Show/Hide */}
            <button
              onClick={() => onToggleVisibility(item.id)}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'cyberpunk' 
                  ? 'hover:bg-green-500/20' 
                  : 'hover:bg-gray-100'
              }`}
              title={isVisible ? 'Hide' : 'Show'}
            >
              {isVisible ? (
                <EyeOff className={`w-4 h-4 transition-all duration-300 ${
                  theme === 'cyberpunk' 
                    ? 'text-white/80' 
                    : 'text-gray-600'
                }`} />
              ) : (
                <Eye className={`w-4 h-4 transition-all duration-300 ${
                  theme === 'cyberpunk' 
                    ? 'text-white/80' 
                    : 'text-gray-600'
                }`} />
              )}
            </button>

            {/* Copy */}
            <button
              onClick={handleCopy}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'cyberpunk' 
                  ? 'hover:bg-green-500/20' 
                  : 'hover:bg-gray-100'
              }`}
              title="Copy"
            >
              {copied ? (
                <Check className={`w-4 h-4 transition-all duration-300 ${
                  theme === 'cyberpunk' 
                    ? 'text-green-400' 
                    : 'text-green-600'
                }`} />
              ) : (
                <Copy className={`w-4 h-4 transition-all duration-300 ${
                  theme === 'cyberpunk' 
                    ? 'text-white/80' 
                    : 'text-gray-600'
                }`} />
              )}
            </button>

            {/* Edit */}
            <button
              onClick={() => onEdit(item.id)}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'cyberpunk' 
                  ? 'hover:bg-blue-500/20' 
                  : 'hover:bg-blue-50'
              }`}
              title="Edit"
            >
              <Edit className={`w-4 h-4 transition-all duration-300 ${
                theme === 'cyberpunk' 
                  ? 'text-blue-400' 
                  : 'text-blue-600'
              }`} />
            </button>

            {/* Delete */}
            <button
              onClick={() => onDelete(item.id)}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'cyberpunk' 
                  ? 'hover:bg-red-500/20' 
                  : 'hover:bg-red-50'
              }`}
              title="Delete"
            >
              <Trash2 className={`w-4 h-4 transition-all duration-300 ${
                theme === 'cyberpunk' 
                  ? 'text-red-400' 
                  : 'text-red-600'
              }`} />
            </button>
          </div>
        </div>

        {/* Additional Fields (if any) */}
        {item.fields && Object.keys(item.fields).length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(item.fields).slice(0, 4).map(([key, value]) => (
                <div key={key} className="text-xs">
                  <span className="text-gray-500">{key}:</span>
                  <span className="ml-1 text-gray-700">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metadata Footer */}
        {item.metadata && (
          <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
            {item.metadata.lastAccessedAt && (
              <span>Last used: {new Date(item.metadata.lastAccessedAt).toLocaleDateString()}</span>
            )}
            {item.metadata.accessCount !== undefined && (
              <span>Used {item.metadata.accessCount} times</span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

