/**
 * Vault Page Component
 * 
 * Personal information vault for storing encrypted data.
 * 
 * Features:
 * - Store personal information (ID cards, passports, etc.)
 * - QR code generation for vault data
 * - AI provider configuration
 * - Usage limits and subscription management
 * - Wallet integration
 * 
 * Note: Currently commented out in routes (App.tsx) - not active in MVP.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { logger } from '../utils/logger';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Barcode } from '../components/ui/Barcode';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { AIProviderSelector, AIProviderConfigModal, ConnectedWalletsList, APIUsageLimits, QRCodeModal, StripePaymentModal, UsageLimitBanner } from '../components/vault';
import { useVault } from '../hooks/useVault';
import { PersonalInfo } from '../types';
import { useBuiltInWallet } from '../hooks/useBuiltInWallet';
import { useTheme } from '../hooks/useTheme';
// Audio components archived - VaultPage is currently commented out in routes
// import { useCyberpunkAudio } from '../components/_archived/useCyberpunkAudio';
// import { MusicPlayer } from '../components/_archived/MusicPlayer';
import { authService } from '../services/AuthService';
import { STORAGE_KEYS } from '../constants/storage';
import { useUsageTracking } from '../hooks/useUsageTracking';
import { usageTrackingService, SubscriptionStatus } from '../services/UsageTrackingService';
import { 
  Shield, 
  User, 
  CreditCard, 
  FileText, 
  Lock,
  Eye,
  EyeOff,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  QrCode,
  AlertCircle,
  Download,
  Upload,
  Wallet,
  CheckCircle,
  Palette,
  Zap,
  Heart,
  Target,
  Circle,
  Coins,
  Hexagon,
  Layers,
  Leaf,
  Monitor,
  Globe,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';

export const VaultPage: React.FC = () => {
  const navigate = useNavigate();
  const { connectedWallets, connectWallet, isLoading: walletLoading } = useBuiltInWallet();
  const { theme, isCyberpunk, setTheme } = useTheme();
  const isWalletConnected = connectedWallets.length > 0;
  
  // Audio system archived - VaultPage is currently commented out in routes
  // const { playConnectionSound, playActionSound } = useCyberpunkAudio(isCyberpunk, {
  //   enableBackground: false
  // });
  
  // Determine if we should use cyberpunk styling
  const shouldUseCyberpunk = isCyberpunk;
  
  // Play connection sound when wallet connects (archived - VaultPage is commented out)
  // useEffect(() => {
  //   if (isWalletConnected && isCyberpunk) {
  //     playConnectionSound();
  //   }
  // }, [isWalletConnected, isCyberpunk, playConnectionSound]);
  
  const {
    personalInfo,
    stats,
    loading,
    error,
    addInfo,
    updateInfo,
    deleteInfo,
    generateMasterQR,
    backupVault,
    restoreVault
  } = useVault();


  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newInfo, setNewInfo] = useState({
    type: 'id_card' as PersonalInfo['type'],
    label: '',
    value: '',
    fields: {} as Record<string, string>
  });
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAIProvider, setSelectedAIProvider] = useState<string>('openai');
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [configProviderId, setConfigProviderId] = useState<string | null>(null);
  
  // QR Code state
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrData, setQrData] = useState<any>(null);
  const [qrTitle, setQrTitle] = useState('');
  const [qrSubtitle, setQrSubtitle] = useState('');
  
  // Stripe payment modal state
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  // Wallet-only vault - no default data refs needed
  
  // Wallet connection is now the only requirement for vault access
  // No email authentication needed
  
  // Wallet-only vault - no default email checks needed

  // Note: Vault data should persist even when wallet is disconnected
  // Users can reconnect and access their data

  // Load saved AI provider selection
  useEffect(() => {
    const savedProvider = localStorage.getItem(STORAGE_KEYS.SELECTED_AI_PROVIDER);
    if (savedProvider) {
      setSelectedAIProvider(savedProvider);
    }
  }, []);

  // Load subscription status for connected wallet
  useEffect(() => {
    if (connectedWallets.length > 0) {
      const walletAddress = connectedWallets[0].address;
      const subscription = usageTrackingService.getSubscriptionStatus(walletAddress);
      setSubscriptionStatus(subscription);
    } else {
      setSubscriptionStatus(null);
    }
  }, [connectedWallets]);

  // Handle successful payment
  const handlePaymentSuccess = (subscription: SubscriptionStatus) => {
    setSubscriptionStatus(subscription);
    setPaymentModalOpen(false);
    toast.success('Pro subscription activated! You now have unlimited wallet assistance.');
  };

  // Wallet QR code is now displayed directly - no auto-generation needed

  // Wallet-only vault - no auto-added data cleanup needed


  // Check authentication status on component mount
  // No email authentication check needed - wallet-only authentication

  // Wallet-only authentication - no auto-added default data

  // Wallet-only vault - no cleanup needed


  // Logout now handled by wallet disconnection

  // AI Provider handlers
  const handleAIProviderChange = (providerId: string) => {
    setSelectedAIProvider(providerId);
    // Store the selection in localStorage for persistence
    localStorage.setItem(STORAGE_KEYS.SELECTED_AI_PROVIDER, providerId);
  };

  const handleConfigureAIProvider = (providerId: string) => {
    setConfigProviderId(providerId);
    setConfigModalOpen(true);
  };

  const handleSaveAIProvider = async (providerId: string, apiKey: string) => {
    // In a real app, you might want to store this securely
    // For now, we'll just show a success message
    localStorage.setItem(`${providerId}_api_key`, apiKey);
    toast.success(`${providerId} API key configured successfully!`);
  };

  const handleCloseConfigModal = () => {
    setConfigModalOpen(false);
    setConfigProviderId(null);
  };
  const [barcodeModal, setBarcodeModal] = useState<{
    isOpen: boolean;
    data: string;
    title: string;
    type: 'qr' | 'barcode';
  }>({
    isOpen: false,
    data: '',
    title: '',
    type: 'qr'
  });
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [backupData, setBackupData] = useState('');

  const infoTypes = [
    // Personal Information (mapped to id_card)
    { value: 'id_card', label: 'Personal Details', icon: User, category: 'personal' },
    
    // Identity Documents
    { value: 'passport', label: 'Passport', icon: FileText, category: 'identity' },
    { value: 'license', label: 'Driver License', icon: FileText, category: 'identity' },
    { value: 'social_security', label: 'Social Security', icon: FileText, category: 'identity' },
    
    // Financial Information
    { value: 'credit_card', label: 'Credit Card', icon: CreditCard, category: 'financial' },
    { value: 'bank_account', label: 'Bank Account', icon: CreditCard, category: 'financial' },
    { value: 'insurance', label: 'Insurance', icon: FileText, category: 'financial' },
    
    // Other
    { value: 'other', label: 'Other', icon: FileText, category: 'documents' },
  ];

  const handleAddInfo = async () => {
    logger.debug('🔄 handleAddInfo called with newInfo:', newInfo);
    
    // Check if any fields are filled
    const hasFields = newInfo.fields ? Object.values(newInfo.fields).some(value => value.trim() !== '') : false;
    
    logger.debug('🔄 handleAddInfo: Fields check result:', { hasFields, fieldsCount: newInfo.fields ? Object.keys(newInfo.fields).length : 0, fields: newInfo.fields });
    
    if (!hasFields) {
      logger.debug('❌ handleAddInfo: No fields filled, showing error to user');
      toast.error('Please fill in at least one field to add information');
      return;
    }
    
    const selectedType = infoTypes.find(t => t.value === newInfo.type);
    
    // Generate label from the type
    const label = selectedType?.label || 'Personal Details';
    
    // Generate value from First Name + Last Name or first non-empty field
    let displayValue = '';
    if (newInfo.type === 'id_card' && newInfo.fields['First Name'] && newInfo.fields['Last Name']) {
      displayValue = `${newInfo.fields['First Name']} ${newInfo.fields['Last Name']}`;
    } else {
      displayValue = Object.values(newInfo.fields).find(value => value.trim() !== '') || '';
    }
    
    logger.debug('🔄 handleAddInfo: Calling addInfo with data:', {
      type: newInfo.type,
      label: label,
      value: displayValue,
      category: selectedType?.category,
      fields: newInfo.fields
    });
    
    // Check if this will be the first item (after adding)
    const wasFirstItem = personalInfo.length === 0;
    
    const success = await addInfo({
      type: newInfo.type,
      label: label,
      value: displayValue,
      category: (selectedType?.category as 'personal' | 'financial' | 'identity' | 'documents') || 'personal',
      fields: newInfo.fields
    });
    
    logger.debug('🔄 handleAddInfo: addInfo result:', success);
    logger.debug('🔄 handleAddInfo: Current error state after addInfo:', error);
    
    if (success) {
      // Audio system archived - VaultPage is currently commented out in routes
      // if (isCyberpunk) {
      //   playActionSound();
      // }
      
      toast.success('Information added successfully!');
      setNewInfo({ type: 'id_card', label: 'Personal Details', value: '', fields: {} });
      setIsAddingNew(false);
      
      // Wallet QR is now displayed directly - no generation needed
    } else {
      // The error will already be shown by the notificationService in useVault
      // and the error state will be displayed in the error banner
      logger.error('❌ Failed to add information. Error state:', error);
    }
  };

  const handleEditInfo = (id: string) => {
    const item = personalInfo.find(info => getInfoId(info) === id);
    if (item) {
      setNewInfo({
        type: item.type,
        label: item.label,
        value: item.value,
        fields: item.fields
      });
      setEditingId(id);
      setIsAddingNew(true);
    }
  };

  const handleSaveEdit = async () => {
    // Check if any fields are filled
    const hasFields = newInfo.fields ? Object.values(newInfo.fields).some(value => value.trim() !== '') : false;
    
    if (editingId && hasFields) {
      const selectedType = infoTypes.find(t => t.value === newInfo.type);
      
      // Generate label from the type
      const label = selectedType?.label || 'Personal Details';
      
      // Generate value from First Name + Last Name or first non-empty field
      let displayValue = '';
      if (newInfo.type === 'id_card' && newInfo.fields['First Name'] && newInfo.fields['Last Name']) {
        displayValue = `${newInfo.fields['First Name']} ${newInfo.fields['Last Name']}`;
      } else {
        displayValue = Object.values(newInfo.fields).find(value => value.trim() !== '') || '';
      }
      
      const success = await updateInfo(editingId, {
        label: label,
        value: displayValue,
        fields: newInfo.fields
      });
      
      if (success) {
        setEditingId(null);
        setNewInfo({ type: 'id_card', label: 'Personal Details', value: '', fields: {} });
        setIsAddingNew(false);
      }
    }
  };

  const handleDeleteInfo = async (id: string) => {
    const success = await deleteInfo(id);
    if (success) {
      // Audio system archived - VaultPage is currently commented out in routes
      // if (isCyberpunk) {
      //   playActionSound();
      // }
      
      // Info will be removed from the list automatically by the hook
      
      // Wallet QR remains - no deletion needed
    }
  };

  const toggleShowValue = (id: string) => {
    setShowValues(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // QR Code handlers - Individual QR codes are not supported
  const handleShowQR = async (id: string) => {
    // Show a message that individual QR codes are not available
    alert('Individual item QR codes are not available. Please use the master vault QR code instead.');
  };

  const handleShowMasterQR = async () => {
    try {
      const response = await generateMasterQRCode();
      if (response.success && response.data) {
        setQrData(response.data);
        setQrTitle('Master Vault QR Code');
        setQrSubtitle('Complete vault access QR code');
        setQrModalOpen(true);
      }
    } catch (error) {
      logger.error('Failed to generate master QR code:', error);
    }
  };

  const getTypeIcon = (type: PersonalInfo['type']) => {
    const typeInfo = infoTypes.find(t => t.value === type);
    return typeInfo ? typeInfo.icon : FileText;
  };

  const getTypeLabel = (type: PersonalInfo['type']) => {
    const typeInfo = infoTypes.find(t => t.value === type);
    return typeInfo ? typeInfo.label : 'Other';
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      personal: 'Personal Information',
      identity: 'Identity Documents',
      financial: 'Financial Information',
      documents: 'Other Documents'
    };
    return labels[category as keyof typeof labels] || 'Other';
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      personal: User,
      identity: Shield,
      financial: CreditCard,
      documents: FileText
    };
    return icons[category as keyof typeof icons] || FileText;
  };

  const getFieldsForType = (type: PersonalInfo['type']) => {
    const fieldTemplates: Record<PersonalInfo['type'], Record<string, string>> = {
      id_card: {
        'First Name': '',
        'Last Name': '',
        'Email': '',
        'Phone Number': '',
        'Address': '',
        'Date of Birth': ''
      },
      passport: {
        'Passport Number': '',
        'Country': '',
        'Issue Date': '',
        'Expiry Date': '',
        'Place of Birth': ''
      },
      license: {
        'License Number': '',
        'State': '',
        'Issue Date': '',
        'Expiry Date': '',
        'Class': '',
        'Address': ''
      },
      credit_card: {
        'Card Number': '',
        'Cardholder Name': '',
        'Expiry Date': '',
        'Security Code': '',
        'Bank': '',
        'Card Type': ''
      },
      bank_account: {
        'Account Number': '',
        'Routing Number': '',
        'Bank Name': '',
        'Account Type': '',
        'Account Holder': ''
      },
      social_security: {
        'SSN': '',
        'Date of Birth': '',
        'Place of Birth': ''
      },
      insurance: {
        'Policy Number': '',
        'Insurance Company': '',
        'Policy Type': '',
        'Coverage Amount': '',
        'Expiry Date': ''
      },
      other: {}
    };
    
    return fieldTemplates[type] || {};
  };

  const generateMasterBarcode = async () => {
    // Check wallet connection first
    if (!isWalletConnected) {
      toast.error('Please connect your wallet to generate vault QR codes');
      return;
    }

    const qrData = await generateMasterQR();
    if (qrData) {
      setBarcodeModal({
        isOpen: true,
        data: qrData.qrCodeDataURL,
        title: 'Master Vault QR Code',
        type: 'qr'
      });
    }
  };


  const handleBackupVault = async () => {
    const backup = await backupVault();
    if (backup) {
      setBackupData(backup);
      setShowBackupModal(true);
    }
  };

  const handleRestoreVault = async () => {
    if (backupData.trim()) {
      const success = await restoreVault(backupData);
      if (success) {
        setShowBackupModal(false);
        setBackupData('');
      }
    }
  };

  // Helper function to get the correct ID
  const getInfoId = (info: PersonalInfo): string => {
    return info._id || info.id || info.infoId || '';
  };

  // Helper function to check if an entry is the default wallet entry
  const isDefaultEmailEntry = (info: PersonalInfo): boolean => {
    // No auto-added entries with wallet auth
    return false;
  };

  // Ensure personalInfo is always an array
  const safePersonalInfo = Array.isArray(personalInfo) ? personalInfo : [];
  
  const filteredInfo = selectedCategory === 'all' 
    ? safePersonalInfo 
    : safePersonalInfo.filter(info => info.category === selectedCategory);

  const groupedInfo = filteredInfo.reduce((acc, info) => {
    if (!acc[info.category]) {
      acc[info.category] = [];
    }
    acc[info.category]!.push(info);
    return acc;
  }, {} as Record<string, PersonalInfo[]>);

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      shouldUseCyberpunk 
        ? 'cyberpunk-theme' 
        : 'gradient-bg'
    }`}>
      <div className="container mx-auto px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-8 p-6 bg-error-50 border border-error-200 rounded-lg flex items-center gap-4">
            <AlertCircle className="w-5 h-5 text-error-600" />
            <div>
              <h3 className="text-sm font-medium text-error-800">Error</h3>
              <p className="text-sm text-error-700">{error}</p>
            </div>
          </div>
        )}

        {/* Wallet Connected Success Banner */}
        {isWalletConnected && (
          <div className={`mb-8 p-6 border rounded-lg flex items-center gap-6 transition-all duration-300 ${
            shouldUseCyberpunk 
              ? 'cyberpunk-card border-green-400/30' 
              : 'bg-success-50 border-success-200'
          }`}>
            <div className="flex items-center gap-3">
              <Shield className={`w-5 h-5 transition-all duration-300 ${
                shouldUseCyberpunk 
                  ? 'text-green-400' 
                  : 'text-success-600'
              }`} />
              <div className="flex-1">
                <p className={`font-medium transition-all duration-300 ${
                  shouldUseCyberpunk 
                    ? 'text-white cyberpunk-font' 
                    : 'text-success-800'
                }`}>
                  {shouldUseCyberpunk ? 'BIT VAULT SECURED' : 'Vault Secured'}
                </p>
                <p className={`text-sm mt-1 transition-all duration-300 ${
                  shouldUseCyberpunk 
                    ? 'text-white/80 cyberpunk-font' 
                    : 'text-success-700'
                }`}>
                  {shouldUseCyberpunk 
                    ? 'Your Safe link is active and your data is protected with quantum encryption.' 
                    : 'Your wallet is connected and your personal information is protected with end-to-end encryption.'}
                </p>
              </div>
            </div>
            <div className={`flex items-center gap-4 transition-all duration-300 ${
              shouldUseCyberpunk 
                ? 'text-green-400' 
                : 'text-success-600'
            }`}>
              <div className={`w-2 h-2 rounded-full animate-pulse transition-all duration-300 ${
                shouldUseCyberpunk 
                  ? 'bg-green-400' 
                  : 'bg-success-500'
              }`}></div>
              <span className={`text-sm font-medium transition-all duration-300 ${
                shouldUseCyberpunk 
                  ? 'cyberpunk-font' 
                  : ''
              }`}>
                {shouldUseCyberpunk ? 'SAFE LINK ACTIVE' : 'Secure'}
              </span>
            </div>
          </div>
        )}

        {/* Authentication Status */}
        {/* Wallet-based authentication - no login/logout buttons needed */}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-glow transition-all duration-300 ${
              shouldUseCyberpunk 
                ? 'cyberpunk-gradient-bg' 
                : 'blue-purple-icon-gradient'
            }`}>
              <Shield className={`w-6 h-6 transition-all duration-300 ${
                shouldUseCyberpunk 
                  ? 'text-white' 
                  : 'text-primary-600'
              }`} />
            </div>
            <div>
              <h1 className={`text-3xl font-bold transition-all duration-300 ${
                shouldUseCyberpunk 
                  ? 'cyberpunk-gradient-text cyberpunk-font' 
                  : 'text-gradient bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent'
              }`}>
                {shouldUseCyberpunk ? 'BIT VAULT' : 'bitVault'}
              </h1>
              <p className={`transition-all duration-300 ${
                shouldUseCyberpunk 
                  ? 'text-white/80' 
                  : 'text-secondary-600'
              }`}>
                {shouldUseCyberpunk 
                  ? 'Secure bitVault data storage and management system' 
                  : 'Securely store and manage your personal information'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-6 text-sm text-secondary-600">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${isWalletConnected ? 'bg-success-500' : 'bg-yellow-500'}`}></div>
                  <span>{isWalletConnected ? 'Wallet connected' : 'Wallet not connected'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Lock className="w-4 h-4" />
                  <span>End-to-end encryption</span>
                </div>
                {stats && (
                  <div className={`flex items-center gap-4 transition-all duration-300 ${
                    shouldUseCyberpunk 
                      ? 'text-white/80 cyberpunk-font' 
                      : ''
                  }`}>
                    <span>{shouldUseCyberpunk ? `${stats.totalItems} Safe modules` : `${stats.totalItems} items stored`}</span>
                  </div>
                )}
              </div>
            
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => setIsAddingNew(true)}
                className="flex items-center gap-4"
                disabled={loading}
                title="Add new information"
              >
                <Plus className="w-4 h-4" />
                <span>Add Information</span>
              </Button>
              
              {/* Display Wallet QR Code */}
              {connectedWallets.length > 0 && (
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white p-2 rounded-lg border border-secondary-200">
                    {connectedWallets[0].address && (
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=64x64&data=${connectedWallets[0].address}`}
                        alt="Wallet QR"
                        className="w-full h-full"
                      />
                    )}
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-secondary-900">{connectedWallets[0].address?.slice(0, 6)}...{connectedWallets[0].address?.slice(-4)}</p>
                    <p className="text-secondary-500 text-xs">Wallet Address</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Category Filter */}
          <div className="mt-6">
            <div className="flex items-center gap-6">
              <span className="text-sm font-medium text-secondary-700">Filter by category:</span>
              <div className="flex gap-4">
                <Button
                  variant={selectedCategory === 'all' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                >
                  All ({personalInfo.length})
                </Button>
                <Button
                  variant={selectedCategory === 'personal' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('personal')}
                >
                  Personal ({personalInfo.filter(info => info.category === 'personal').length})
                </Button>
                <Button
                  variant={selectedCategory === 'identity' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('identity')}
                >
                  Identity ({personalInfo.filter(info => info.category === 'identity').length})
                </Button>
                <Button
                  variant={selectedCategory === 'financial' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('financial')}
                >
                  Financial ({personalInfo.filter(info => info.category === 'financial').length})
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Add/Edit Form */}
        {(isAddingNew || editingId) && (
          <Card className={`mb-6 transition-all duration-300 ${
            shouldUseCyberpunk ? 'cyberpunk-card' : ''
          }`}>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <h3 className={`text-lg font-semibold transition-all duration-300 ${
                  shouldUseCyberpunk 
                    ? 'text-white cyberpunk-font' 
                    : ''
                }`}>
                  {shouldUseCyberpunk 
                    ? (editingId ? 'EDIT BIT MODULE' : 'ADD BIT MODULE')
                    : (editingId ? 'Edit Information' : 'Add New Information')
                  }
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingId(null);
                    setNewInfo({ type: 'id_card', label: 'Personal Details', value: '', fields: {} });
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Information Type
                  </label>
                  <select
                    value={newInfo.type || 'id_card'}
                    onChange={(e) => setNewInfo({ ...newInfo, type: e.target.value as PersonalInfo['type'] })}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                  >
                    {infoTypes.map(type => (
                      <option key={type.value} value={type.value} className="text-gray-900">
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic Fields Based on Type */}
              {Object.keys(getFieldsForType(newInfo.type)).length > 0 && (
                <div className="mt-6">
                  <h4 className="text-md font-semibold text-secondary-900 mb-4">
                    Additional Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(getFieldsForType(newInfo.type)).map(([fieldName, defaultValue]) => (
                      <div key={fieldName}>
                        <Input
                          label={fieldName}
                          value={newInfo.fields[fieldName] || ''}
                          onChange={(e) => setNewInfo({
                            ...newInfo,
                            fields: {
                              ...newInfo.fields,
                              [fieldName]: e.target.value
                            }
                          })}
                          placeholder={defaultValue || `Enter ${fieldName.toLowerCase()}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-4 mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingId(null);
                    setNewInfo({ type: 'id_card', label: 'Personal Details', value: '', fields: {} });
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={editingId ? handleSaveEdit : handleAddInfo}
                  className="flex items-center gap-4"
                  disabled={loading}
                >
                  {loading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{editingId ? 'Save Changes' : 'Add Information'}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Information Grid */}
        <div className="gap-12">
          {Object.entries(groupedInfo).map(([category, items]) => {
            const CategoryIcon = getCategoryIcon(category);
            
            return (
              <div key={category}>
                {/* Category Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <CategoryIcon className="w-4 h-4 text-primary-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-secondary-900">
                    {getCategoryLabel(category)}
                  </h2>
                  <span className="px-2 py-1 text-xs font-medium bg-secondary-100 text-secondary-700 rounded-full">
                    {items.length} items
                  </span>
                </div>
                
                {/* Items Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((info, index) => {
            const TypeIcon = getTypeIcon(info.type);
            const isShowing = showValues[getInfoId(info)];
            
            return (
              <Card key={`vault-${info._id || info.id || `temp-${Date.now()}-${index}`}-${category}-${index}`} 
                    className={`hover:shadow-lg transition-shadow ${
                      isWalletConnected 
                        ? 'border-success-200 bg-white shadow-sm hover:shadow-success-100' 
                        : 'border-secondary-200 bg-secondary-50 opacity-75'
                    }`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isWalletConnected 
                          ? 'bg-success-100' 
                          : 'bg-secondary-200'
                      }`}>
                        <TypeIcon className={`w-5 h-5 ${
                          isWalletConnected 
                            ? 'text-success-600' 
                            : 'text-secondary-500'
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className={`font-semibold ${
                            isWalletConnected 
                              ? 'text-secondary-900' 
                              : 'text-secondary-600'
                          }`}>{info.label}</h3>
                          {isWalletConnected && (
                            <div className="flex items-center gap-2">
                              <Lock className="w-3 h-3 text-success-500" />
                              <span className="text-xs text-success-600 font-medium">Secured</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-secondary-500">{getTypeLabel(info.type)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleShowValue(getInfoId(info))}
                        title="Toggle visibility"
                      >
                        {isShowing ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      
                      {/* Show edit/delete buttons only for non-default entries */}
                      {!isDefaultEmailEntry(info) && (
                        <>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditInfo(getInfoId(info))}
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteInfo(getInfoId(info))}
                            className="text-error-600 hover:text-error-700"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      
                      {/* Show lock icon for default email */}
                      {isDefaultEmailEntry(info) && (
                        <div className="flex items-center text-primary-600" title="Auto-added from your account">
                          <Lock className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="gap-6">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Value
                      </label>
                      <div className="p-3 bg-secondary-50 rounded-lg border">
                        {isShowing ? (
                          <span className="text-secondary-900">{info.value}</span>
                        ) : (
                          <span className="text-secondary-500">••••••••••••</span>
                        )}
                      </div>
                    </div>

                    {/* Additional Fields */}
                    {info.fields && Object.keys(info.fields).length > 0 && (
                      <div className="gap-4">
                        <label className="block text-sm font-medium text-secondary-700">
                          Additional Details
                        </label>
                        <div className="gap-4">
                          {Object.entries(info.fields).map(([fieldName, fieldValue], fieldIndex) => (
                            <div key={`${getInfoId(info)}-field-${fieldIndex}-${fieldName}`} className="flex justify-between items-center p-2 bg-secondary-50 rounded border">
                              <span className="text-sm font-medium text-secondary-600">{fieldName}:</span>
                              <span className="text-sm text-secondary-900">
                                {isShowing ? fieldValue : '••••••••••••'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-secondary-500">
                      <div className="flex items-center gap-3">
                        <Lock className="w-3 h-3" />
                        <span>Encrypted</span>
                      </div>
                      <span>Added {info.createdAt}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {personalInfo.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-secondary-400" />
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                No personal information stored
              </h3>
              <p className="text-secondary-600 mb-6">
                Start by adding your personal information to keep it secure and easily accessible.
              </p>
              <Button onClick={() => setIsAddingNew(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Information
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Section 2: Connected Wallets */}
        <div className="mt-8">
          <ConnectedWalletsList />
        </div>

        {/* Section 3: Usage Limit Banner (Freemium) */}
        {connectedWallets.length > 0 && (
          <div className="mt-8">
            <UsageLimitBanner onUpgradeClick={() => setPaymentModalOpen(true)} />
          </div>
        )}

        {/* Section 4: AI Provider Selection */}
        <div className="mt-8">
          <AIProviderSelector
            selectedProvider={selectedAIProvider}
            onProviderChange={handleAIProviderChange}
            onConfigureProvider={handleConfigureAIProvider}
          />
        </div>

        {/* Section 4: Theme Selection */}
        <div className="mt-8">
          <div className={`p-6 rounded-lg border transition-all duration-300 ${
            shouldUseCyberpunk 
              ? 'cyberpunk-card border-green-400/30' 
              : 'bg-white border-secondary-200'
          }`}>
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                shouldUseCyberpunk 
                  ? 'cyberpunk-gradient-bg' 
                  : 'bg-gradient-to-br from-purple-50 to-purple-100'
              }`}>
                <Palette className={`w-5 h-5 transition-all duration-300 ${
                  shouldUseCyberpunk 
                    ? 'text-white' 
                    : 'text-purple-600'
                }`} />
              </div>
              <div>
                <h3 className={`text-lg font-semibold transition-all duration-300 ${
                  shouldUseCyberpunk 
                    ? 'text-white cyberpunk-font' 
                    : 'text-secondary-900'
                }`}>
                  {shouldUseCyberpunk ? 'BIT THEME SELECTOR' : 'Theme Selection'}
                </h3>
                <p className={`text-sm transition-all duration-300 ${
                  shouldUseCyberpunk 
                    ? 'text-white/80 cyberpunk-font' 
                    : 'text-secondary-600'
                }`}>
                  {shouldUseCyberpunk 
                    ? 'Choose your neural interface theme' 
                    : 'Customize your BitAI experience with different themes'}
                </p>
              </div>
            </div>

            {/* Theme Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* Cyberpunk Theme */}
              <div className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
                shouldUseCyberpunk 
                  ? 'cyberpunk-card border-green-400/50 bg-green-500/10' 
                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
              }`}>
                <div className="text-center">
                  <div className={`w-12 h-12 mx-auto mb-2 rounded-lg flex items-center justify-center ${
                    shouldUseCyberpunk 
                      ? 'cyberpunk-gradient-bg' 
                      : 'bg-gradient-to-br from-green-500 to-purple-500'
                  }`}>
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h4 className={`text-sm font-medium transition-all duration-300 ${
                    shouldUseCyberpunk 
                      ? 'text-white cyberpunk-font' 
                      : 'text-gray-900'
                  }`}>
                    Cyberpunk
                  </h4>
                  <p className={`text-xs transition-all duration-300 ${
                    shouldUseCyberpunk 
                      ? 'text-white/80' 
                      : 'text-gray-500'
                  }`}>
                    {shouldUseCyberpunk ? 'ACTIVE' : 'Default'}
                  </p>
                </div>
              </div>

              {/* Barbie Theme */}
              <div className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
                shouldUseCyberpunk 
                  ? 'bg-pink-300 border-pink-200 hover:border-pink-100 hover:bg-pink-400 shadow-xl shadow-pink-300/40 backdrop-blur-sm'
                  : 'bg-pink-400 border-pink-300 hover:border-pink-200 hover:bg-pink-500 shadow-xl shadow-pink-400/50 backdrop-blur-sm'
              }`}>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-lg flex items-center justify-center bg-gradient-to-br from-pink-400 to-pink-600">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <h4 className={`text-sm font-bold transition-all duration-300 ${
                    shouldUseCyberpunk ? 'text-white' : 'text-white'
                  }`}>Barbie</h4>
                  <p className={`text-xs font-medium transition-all duration-300 ${
                    shouldUseCyberpunk ? 'text-white/80' : 'text-white/80'
                  }`}>Coming Soon</p>
                </div>
              </div>

              {/* Soccer Theme */}
              <div className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
                shouldUseCyberpunk 
                  ? 'bg-green-300 border-green-200 hover:border-green-100 hover:bg-green-400 shadow-xl shadow-green-300/40 backdrop-blur-sm'
                  : 'bg-green-400 border-green-300 hover:border-green-200 hover:bg-green-500 shadow-xl shadow-green-400/50 backdrop-blur-sm'
              }`}>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-lg flex items-center justify-center bg-gradient-to-br from-green-500 to-green-700">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h4 className={`text-sm font-bold transition-all duration-300 ${
                    shouldUseCyberpunk ? 'text-white' : 'text-white'
                  }`}>Soccer</h4>
                  <p className={`text-xs font-medium transition-all duration-300 ${
                    shouldUseCyberpunk ? 'text-white/80' : 'text-white/80'
                  }`}>Coming Soon</p>
                </div>
              </div>

              {/* Cricket Theme */}
              <div className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
                shouldUseCyberpunk 
                  ? 'bg-orange-300 border-orange-200 hover:border-orange-100 hover:bg-orange-400 shadow-xl shadow-orange-300/40 backdrop-blur-sm'
                  : 'bg-orange-400 border-orange-300 hover:border-orange-200 hover:bg-orange-500 shadow-xl shadow-orange-400/50 backdrop-blur-sm'
              }`}>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-lg flex items-center justify-center bg-gradient-to-br from-orange-500 to-orange-700">
                    <Circle className="w-6 h-6 text-white" />
                  </div>
                  <h4 className={`text-sm font-bold transition-all duration-300 ${
                    shouldUseCyberpunk ? 'text-white' : 'text-white'
                  }`}>Cricket</h4>
                  <p className={`text-xs font-medium transition-all duration-300 ${
                    shouldUseCyberpunk ? 'text-white/80' : 'text-white/80'
                  }`}>Coming Soon</p>
                </div>
              </div>

              {/* Crypto Theme */}
              <div className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
                shouldUseCyberpunk 
                  ? 'bg-yellow-300 border-yellow-200 hover:border-yellow-100 hover:bg-yellow-400 shadow-xl shadow-yellow-300/40 backdrop-blur-sm'
                  : 'bg-yellow-400 border-yellow-300 hover:border-yellow-200 hover:bg-yellow-500 shadow-xl shadow-yellow-400/50 backdrop-blur-sm'
              }`}>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-lg flex items-center justify-center bg-gradient-to-br from-yellow-500 to-yellow-700">
                    <Coins className="w-6 h-6 text-white" />
                  </div>
                  <h4 className={`text-sm font-bold transition-all duration-300 ${
                    shouldUseCyberpunk ? 'text-white' : 'text-white'
                  }`}>Crypto</h4>
                  <p className={`text-xs font-medium transition-all duration-300 ${
                    shouldUseCyberpunk ? 'text-white/80' : 'text-white/80'
                  }`}>Coming Soon</p>
                </div>
              </div>

              {/* Solana Theme */}
              <div className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
                shouldUseCyberpunk 
                  ? 'bg-purple-300 border-purple-200 hover:border-purple-100 hover:bg-purple-400 shadow-xl shadow-purple-300/40 backdrop-blur-sm'
                  : 'bg-purple-400 border-purple-300 hover:border-purple-200 hover:bg-purple-500 shadow-xl shadow-purple-400/50 backdrop-blur-sm'
              }`}>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-lg flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-700">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h4 className={`text-sm font-bold transition-all duration-300 ${
                    shouldUseCyberpunk ? 'text-white' : 'text-white'
                  }`}>Solana</h4>
                  <p className={`text-xs font-medium transition-all duration-300 ${
                    shouldUseCyberpunk ? 'text-white/80' : 'text-white/80'
                  }`}>Coming Soon</p>
                </div>
              </div>

              {/* Ethereum Theme */}
              <div className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
                shouldUseCyberpunk 
                  ? 'bg-blue-300 border-blue-200 hover:border-blue-100 hover:bg-blue-400 shadow-xl shadow-blue-300/40 backdrop-blur-sm'
                  : 'bg-blue-400 border-blue-300 hover:border-blue-200 hover:bg-blue-500 shadow-xl shadow-blue-400/50 backdrop-blur-sm'
              }`}>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-lg flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700">
                    <Hexagon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className={`text-sm font-bold transition-all duration-300 ${
                    shouldUseCyberpunk ? 'text-white' : 'text-white'
                  }`}>Ethereum</h4>
                  <p className={`text-xs font-medium transition-all duration-300 ${
                    shouldUseCyberpunk ? 'text-white/80' : 'text-white/80'
                  }`}>Coming Soon</p>
                </div>
              </div>

              {/* Base Theme */}
              <div className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
                shouldUseCyberpunk 
                  ? 'bg-indigo-300 border-indigo-200 hover:border-indigo-100 hover:bg-indigo-400 shadow-xl shadow-indigo-300/40 backdrop-blur-sm'
                  : 'bg-indigo-400 border-indigo-300 hover:border-indigo-200 hover:bg-indigo-500 shadow-xl shadow-indigo-400/50 backdrop-blur-sm'
              }`}>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-lg flex items-center justify-center bg-gradient-to-br from-indigo-500 to-indigo-700">
                    <Layers className="w-6 h-6 text-white" />
                  </div>
                  <h4 className={`text-sm font-bold transition-all duration-300 ${
                    shouldUseCyberpunk ? 'text-white' : 'text-white'
                  }`}>Base</h4>
                  <p className={`text-xs font-medium transition-all duration-300 ${
                    shouldUseCyberpunk ? 'text-white/80' : 'text-white/80'
                  }`}>Coming Soon</p>
                </div>
              </div>

              {/* Nature Theme */}
              <div className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
                shouldUseCyberpunk 
                  ? 'bg-emerald-300 border-emerald-200 hover:border-emerald-100 hover:bg-emerald-400 shadow-xl shadow-emerald-300/40 backdrop-blur-sm'
                  : 'bg-emerald-400 border-emerald-300 hover:border-emerald-200 hover:bg-emerald-500 shadow-xl shadow-emerald-400/50 backdrop-blur-sm'
              }`}>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-lg flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700">
                    <Leaf className="w-6 h-6 text-white" />
                  </div>
                  <h4 className={`text-sm font-bold transition-all duration-300 ${
                    shouldUseCyberpunk ? 'text-white' : 'text-white'
                  }`}>Nature</h4>
                  <p className={`text-xs font-medium transition-all duration-300 ${
                    shouldUseCyberpunk ? 'text-white/80' : 'text-white/80'
                  }`}>Coming Soon</p>
                </div>
              </div>

              {/* Digital Theme */}
              <div className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
                shouldUseCyberpunk 
                  ? 'bg-cyan-300 border-cyan-200 hover:border-cyan-100 hover:bg-cyan-400 shadow-xl shadow-cyan-300/40 backdrop-blur-sm'
                  : 'bg-cyan-400 border-cyan-300 hover:border-cyan-200 hover:bg-cyan-500 shadow-xl shadow-cyan-400/50 backdrop-blur-sm'
              }`}>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-lg flex items-center justify-center bg-gradient-to-br from-cyan-500 to-cyan-700">
                    <Monitor className="w-6 h-6 text-white" />
                  </div>
                  <h4 className={`text-sm font-bold transition-all duration-300 ${
                    shouldUseCyberpunk ? 'text-white' : 'text-white'
                  }`}>Digital</h4>
                  <p className={`text-xs font-medium transition-all duration-300 ${
                    shouldUseCyberpunk ? 'text-white/80' : 'text-white/80'
                  }`}>Coming Soon</p>
                </div>
              </div>

              {/* Mars Theme */}
              <div className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
                shouldUseCyberpunk 
                  ? 'bg-red-300 border-red-200 hover:border-red-100 hover:bg-red-400 shadow-xl shadow-red-300/40 backdrop-blur-sm'
                  : 'bg-red-400 border-red-300 hover:border-red-200 hover:bg-red-500 shadow-xl shadow-red-400/50 backdrop-blur-sm'
              }`}>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-lg flex items-center justify-center bg-gradient-to-br from-red-500 to-red-700">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <h4 className={`text-sm font-bold transition-all duration-300 ${
                    shouldUseCyberpunk ? 'text-white' : 'text-white'
                  }`}>Mars</h4>
                  <p className={`text-xs font-medium transition-all duration-300 ${
                    shouldUseCyberpunk ? 'text-white/80' : 'text-white/80'
                  }`}>Coming Soon</p>
                </div>
              </div>
            </div>

            {/* Theme Info */}
            <div className={`mt-6 p-4 rounded-lg border transition-all duration-300 ${
              shouldUseCyberpunk 
                ? 'cyberpunk-card border-blue-400/30' 
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-start gap-4">
                <Info className={`w-5 h-5 mt-0.5 transition-all duration-300 ${
                  shouldUseCyberpunk ? 'text-blue-400' : 'text-blue-600'
                }`} />
                <div className={`text-sm transition-all duration-300 ${
                  shouldUseCyberpunk ? 'text-white/80 cyberpunk-font' : 'text-blue-800'
                }`}>
                  <p className={`font-medium transition-all duration-300 ${
                    shouldUseCyberpunk ? 'cyberpunk-font' : ''
                  }`}>
                    {shouldUseCyberpunk ? 'THEME CUSTOMIZATION INFO' : 'Theme Customization'}
                  </p>
                  <p className={`mt-1 transition-all duration-300 ${
                    shouldUseCyberpunk ? 'cyberpunk-font' : ''
                  }`}>
                    {shouldUseCyberpunk 
                      ? 'Cyberpunk theme activates automatically when wallet is connected. Additional themes will be available in future updates.' 
                      : 'Cyberpunk theme activates automatically when wallet is connected. Additional themes will be available in future updates.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>


      {/* Backup Modal */}
      {showBackupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Backup & Restore</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBackupModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="gap-8">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Backup Data
                  </label>
                  <textarea
                    value={backupData}
                    onChange={(e) => setBackupData(e.target.value)}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows={6}
                    placeholder="Paste backup data here to restore..."
                  />
                </div>
                
                <div className="flex justify-end gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowBackupModal(false)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRestoreVault}
                    disabled={!backupData.trim() || loading}
                    className="flex items-center gap-4"
                  >
                    {loading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    <span>Restore</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Barcode Modal */}
      <Barcode
        isOpen={barcodeModal.isOpen}
        onClose={() => setBarcodeModal({ ...barcodeModal, isOpen: false })}
        data={barcodeModal.data}
        title={barcodeModal.title}
        type={barcodeModal.type}
        description="Scan this code to access the stored information"
      />

      {/* AI Provider Configuration Modal */}
      <AIProviderConfigModal
        providerId={configProviderId}
        providerName={configProviderId ? configProviderId.charAt(0).toUpperCase() + configProviderId.slice(1) : ''}
        isOpen={configModalOpen}
        onClose={handleCloseConfigModal}
        onSave={handleSaveAIProvider}
      />

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        qrData={qrData}
        title={qrTitle}
        subtitle={qrSubtitle}
      />

      {/* Stripe Payment Modal */}
      {connectedWallets.length > 0 && (
        <StripePaymentModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          walletAddress={connectedWallets[0].address}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
      </div>
    </div>
  );
};

export default VaultPage;
