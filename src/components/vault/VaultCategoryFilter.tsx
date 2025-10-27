import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { User, CreditCard, Shield, FileText, Grid } from 'lucide-react';

interface VaultCategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  stats: {
    personal: number;
    financial: number;
    identity: number;
    documents: number;
  };
}

export const VaultCategoryFilter: React.FC<VaultCategoryFilterProps> = ({
  selectedCategory,
  onCategoryChange,
  stats,
}) => {
  const categories = [
    { id: 'all', label: 'All Items', icon: Grid, count: Object.values(stats).reduce((a, b) => a + b, 0) },
    { id: 'personal', label: 'Personal', icon: User, count: stats.personal },
    { id: 'financial', label: 'Financial', icon: CreditCard, count: stats.financial },
    { id: 'identity', label: 'Identity', icon: Shield, count: stats.identity },
    { id: 'documents', label: 'Documents', icon: FileText, count: stats.documents },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => (
        <motion.button
          key={category.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onCategoryChange(category.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap',
            selectedCategory === category.id
              ? 'bg-primary-600 text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:shadow-sm'
          )}
        >
          <category.icon className="w-4 h-4" />
          <span>{category.label}</span>
          {category.count > 0 && (
            <span className={cn(
              'px-2 py-0.5 rounded-full text-xs font-semibold',
              selectedCategory === category.id
                ? 'bg-white/20 text-white'
                : 'bg-gray-100 text-gray-600'
            )}>
              {category.count}
            </span>
          )}
        </motion.button>
      ))}
    </div>
  );
};


