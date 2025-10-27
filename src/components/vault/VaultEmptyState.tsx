import React from 'react';
import { Shield, Plus, Lock, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';

interface VaultEmptyStateProps {
  onAddFirst: () => void;
}

export const VaultEmptyState: React.FC<VaultEmptyStateProps> = ({ onAddFirst }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 px-6"
    >
      {/* Icon */}
      <div className="relative mb-6">
        <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-accent-100 rounded-3xl flex items-center justify-center">
          <Shield className="w-12 h-12 text-primary-600" />
        </div>
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5] 
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-2 -right-2"
        >
          <Sparkles className="w-8 h-8 text-accent-500" />
        </motion.div>
      </div>

      {/* Text */}
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Your Safe Vault is Empty
      </h2>
      <p className="text-gray-500 text-center max-w-md mb-8">
        Start securing your personal information with end-to-end encryption. 
        Your data is protected by your wallet and never leaves your control.
      </p>

      {/* CTA Button */}
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          onClick={onAddFirst}
          size="lg"
          className="shadow-lg hover:shadow-xl transition-shadow"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Your First Item
        </Button>
      </motion.div>

      {/* Features */}
      <div className="grid grid-cols-3 gap-6 mt-12 max-w-2xl">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-2">
            <Lock className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-sm font-medium text-gray-700">Encrypted</p>
          <p className="text-xs text-gray-500">End-to-end security</p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mx-auto mb-2">
            <Shield className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-sm font-medium text-gray-700">Private</p>
          <p className="text-xs text-gray-500">Only you can access</p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-2">
            <Sparkles className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-sm font-medium text-gray-700">Wallet-Based</p>
          <p className="text-xs text-gray-500">Your keys, your data</p>
        </div>
      </div>
    </motion.div>
  );
};


