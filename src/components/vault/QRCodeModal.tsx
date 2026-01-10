/**
 * QR Code Modal Component
 * 
 * Displays QR codes for vault items and master vault with:
 * - QR code display
 * - Download functionality
 * - Copy data to clipboard
 * - Expiry date display
 * 
 * Used in VaultPage for displaying QR codes of vault data.
 */
import React, { useState, useEffect } from 'react';
import { X, Download, Copy, QrCode } from 'lucide-react';
import { QRCodeData } from '../../utils/qrGenerator';
import { logger } from '../../utils/logger';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrData?: QRCodeData;
  title?: string;
  subtitle?: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  qrData,
  title = 'QR Code',
  subtitle
}) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && qrData) {
      setIsLoading(true);
      // Simulate loading time for better UX
      const timer = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, qrData]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!qrData) return;
    
    try {
      const link = document.createElement('a');
      link.href = qrData.qrCode;
      link.download = `qr-code-${Date.now()}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      logger.error('Failed to download QR code:', error);
    }
  };

  const handleCopyData = async () => {
    if (!qrData) return;
    
    try {
      await navigator.clipboard.writeText(qrData.data);
      // You could add a toast notification here
      logger.debug('QR code data copied to clipboard');
    } catch (error) {
      logger.error('Failed to copy QR code data:', error);
    }
  };

  const formatExpiryDate = (date: Date | string | undefined) => {
    if (!date) return 'Never';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) return 'Invalid date';
    
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <QrCode className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              {subtitle && (
                <p className="text-sm text-gray-500">{subtitle}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-500">Generating QR code...</p>
            </div>
          ) : qrData ? (
            <div className="space-y-6">
              {/* QR Code Display */}
              <div className="flex justify-center">
                <div className="p-4 bg-white border-2 border-gray-200 rounded-xl">
                  <img
                    src={qrData.qrCode}
                    alt="QR Code"
                    className="w-48 h-48"
                  />
                </div>
              </div>

              {/* QR Code Info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Data:</label>
                  <p className="text-sm text-gray-600 break-all font-mono bg-white p-2 rounded border">
                    {qrData.data}
                  </p>
                </div>
                
                {qrData.metadata?.expiresAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Expires:</label>
                    <p className="text-sm text-gray-600">
                      {formatExpiryDate(qrData.metadata.expiresAt)}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleDownload}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
                
                <button
                  onClick={handleCopyData}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Data</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <QrCode className="w-12 h-12 text-gray-400" />
              <p className="mt-4 text-gray-500">No QR code data available</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>QR code generated locally - no data sent to servers</span>
          </div>
        </div>
      </div>
    </div>
  );
};

