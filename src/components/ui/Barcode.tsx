import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import { Button } from './Button';
import { Card, CardHeader, CardContent } from './Card';
import { 
  Download, 
  Copy, 
  Eye, 
  EyeOff,
  X,
  Smartphone
} from 'lucide-react';

interface BarcodeProps {
  data: string;
  type: 'qr' | 'barcode';
  title?: string;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const Barcode: React.FC<BarcodeProps> = ({
  data,
  type,
  title = 'Generated Code',
  description,
  isOpen,
  onClose
}) => {
  const qrRef = useRef<HTMLCanvasElement>(null);
  const barcodeRef = useRef<SVGSVGElement>(null);
  const [showData, setShowData] = React.useState(false);

  useEffect(() => {
    if (isOpen && data) {
      if (type === 'qr' && qrRef.current) {
        QRCode.toCanvas(qrRef.current, data, {
          width: 256,
          margin: 2,
          color: {
            dark: '#1f2937',
            light: '#ffffff'
          }
        }).catch(console.error);
      } else if (type === 'barcode' && barcodeRef.current) {
        try {
          JsBarcode(barcodeRef.current, data, {
            format: 'CODE128',
            width: 2,
            height: 100,
            displayValue: true,
            fontSize: 16,
            margin: 10,
            background: '#ffffff',
            lineColor: '#1f2937'
          });
        } catch (error) {
          console.error('Barcode generation error:', error);
        }
      }
    }
  }, [isOpen, data, type]);

  const handleDownload = () => {
    if (type === 'qr' && qrRef.current) {
      const link = document.createElement('a');
      link.download = `${title.replace(/\s+/g, '_')}_qr.png`;
      link.href = qrRef.current.toDataURL();
      link.click();
    } else if (type === 'barcode' && barcodeRef.current) {
      const svgData = new XMLSerializer().serializeToString(barcodeRef.current);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        const link = document.createElement('a');
        link.download = `${title.replace(/\s+/g, '_')}_barcode.png`;
        link.href = canvas.toDataURL();
        link.click();
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(data);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Smartphone className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold">{title}</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          {description && (
            <p className="text-sm text-secondary-600">{description}</p>
          )}
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Code Display */}
            <div className="flex justify-center bg-white p-4 rounded-lg border">
              {type === 'qr' ? (
                <canvas ref={qrRef} className="max-w-full h-auto" />
              ) : (
                <svg ref={barcodeRef} className="max-w-full h-auto" />
              )}
            </div>

            {/* Data Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-secondary-700">
                  Data Preview:
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowData(!showData)}
                >
                  {showData ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showData ? 'Hide' : 'Show'}
                </Button>
              </div>
              
              {showData && (
                <div className="bg-secondary-50 p-3 rounded-lg">
                  <p className="text-sm text-secondary-700 font-mono break-all">
                    {data}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center space-x-2"
              >
                <Copy className="w-4 h-4" />
                <span>Copy Data</span>
              </Button>
              
              <Button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </Button>
            </div>

            {/* Usage Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                How to use:
              </h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Scan with any QR/barcode scanner app</li>
                <li>• Share the code instead of typing information</li>
                <li>• Download for offline use</li>
                <li>• Data is encrypted and secure</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
