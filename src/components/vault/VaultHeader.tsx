import React from 'react';
import { Search, Plus, Download, Upload, QrCode, Filter, Grid, List } from 'lucide-react';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';

interface VaultHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddNew: () => void;
  onBackup: () => void;
  onRestore: () => void;
  onGenerateQR: () => void;
  itemCount: number;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

export const VaultHeader: React.FC<VaultHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onAddNew,
  onBackup,
  onRestore,
  onGenerateQR,
  itemCount,
  viewMode,
  onViewModeChange,
}) => {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Title and Stats */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Safe Vault</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {itemCount} {itemCount === 1 ? 'item' : 'items'} • End-to-end encrypted
            </p>
          </div>

          {/* Primary Action */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={onAddNew}
              size="lg"
              className="shadow-sm hover:shadow-md transition-shadow"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Item
            </Button>
          </motion.div>
        </div>

        {/* Search and Actions Bar */}
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="flex-1 max-w-2xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search vault items..."
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange('grid')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'grid' 
                  ? 'bg-white shadow-sm text-gray-900' 
                  : 'text-gray-500 hover:text-gray-700'
              )}
              title="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'list' 
                  ? 'bg-white shadow-sm text-gray-900' 
                  : 'text-gray-500 hover:text-gray-700'
              )}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Actions Dropdown */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onBackup}
              className="hidden md:flex"
            >
              <Download className="w-4 h-4 mr-2" />
              Backup
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onRestore}
              className="hidden md:flex"
            >
              <Upload className="w-4 h-4 mr-2" />
              Restore
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onGenerateQR}
              className="hidden md:flex"
            >
              <QrCode className="w-4 h-4 mr-2" />
              QR Code
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function for cn
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}


