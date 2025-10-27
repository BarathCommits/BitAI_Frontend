import React from 'react';
import { Shield, CreditCard, User, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

interface VaultStatsProps {
  stats: {
    totalItems: number;
    categories: {
      personal: number;
      financial: number;
      identity: number;
      documents: number;
    };
  };
}

export const VaultStats: React.FC<VaultStatsProps> = ({ stats }) => {
  const categories = [
    {
      name: 'Personal',
      count: stats.categories.personal,
      icon: User,
      color: 'from-blue-500 to-blue-600',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      name: 'Financial',
      count: stats.categories.financial,
      icon: CreditCard,
      color: 'from-green-500 to-green-600',
      lightColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      name: 'Identity',
      count: stats.categories.identity,
      icon: Shield,
      color: 'from-purple-500 to-purple-600',
      lightColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      name: 'Documents',
      count: stats.categories.documents,
      icon: FileText,
      color: 'from-orange-500 to-orange-600',
      lightColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {categories.map((category, index) => (
        <motion.div
          key={category.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${category.lightColor} rounded-lg flex items-center justify-center`}>
              <category.icon className={`w-5 h-5 ${category.textColor}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{category.count}</p>
              <p className="text-xs text-gray-500">{category.name}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};


