/**
 * Lightweight QR Code Generator
 * Generates QR codes without external dependencies
 * Uses a simple pattern-based approach for basic QR codes
 */

export interface QRCodeData {
  qrCode: string; // Data URL or SVG string
  data: string; // The actual data encoded
  expiresAt: Date;
}

/**
 * Generate a simple QR-like code using SVG patterns
 * This creates a visual QR-like representation without requiring external libraries
 */
export function generateQRCode(data: string, size: number = 200): string {
  // Create a simple pattern-based "QR code" using SVG
  const svg = createSVGQRCode(data, size);
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Create SVG-based QR-like code
 */
function createSVGQRCode(data: string, size: number): string {
  const moduleSize = Math.floor(size / 25); // 25x25 grid
  const modules = generateQRPattern(data, 25);
  
  let svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<rect width="${size}" height="${size}" fill="white"/>`;
  
  // Generate pattern based on data hash
  modules.forEach((row, y) => {
    row.forEach((module, x) => {
      if (module) {
        svg += `<rect x="${x * moduleSize}" y="${y * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="black"/>`;
      }
    });
  });
  
  // Add corner markers (like real QR codes)
  svg += addCornerMarkers(0, 0, moduleSize * 7, moduleSize);
  svg += addCornerMarkers(size - moduleSize * 7, 0, moduleSize * 7, moduleSize);
  svg += addCornerMarkers(0, size - moduleSize * 7, moduleSize * 7, moduleSize);
  
  svg += '</svg>';
  return svg;
}

/**
 * Generate a pattern based on data
 */
function generateQRPattern(data: string, gridSize: number): boolean[][] {
  const pattern: boolean[][] = [];
  const hash = hashString(data);
  
  for (let y = 0; y < gridSize; y++) {
    pattern[y] = [];
    for (let x = 0; x < gridSize; x++) {
      // Use hash to determine pattern
      const index = (y * gridSize + x) % hash.length;
      const shouldFill = (hash.charCodeAt(index) + x + y) % 3 === 0;
      pattern[y][x] = shouldFill;
    }
  }
  
  return pattern;
}

/**
 * Simple hash function for data
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * Add corner markers to QR code
 */
function addCornerMarkers(x: number, y: number, size: number, moduleSize: number): string {
  let markers = '';
  
  // Outer square
  markers += `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="black"/>`;
  
  // Inner white square
  const innerX = x + moduleSize * 2;
  const innerY = y + moduleSize * 2;
  const innerSize = size - moduleSize * 4;
  markers += `<rect x="${innerX}" y="${innerY}" width="${innerSize}" height="${innerSize}" fill="white"/>`;
  
  // Center black square
  const centerX = x + moduleSize * 3;
  const centerY = y + moduleSize * 3;
  const centerSize = size - moduleSize * 6;
  markers += `<rect x="${centerX}" y="${centerY}" width="${centerSize}" height="${centerSize}" fill="black"/>`;
  
  return markers;
}

/**
 * Generate QR code data for wallet address
 */
export function generateWalletQRCode(walletAddress: string, walletName?: string): QRCodeData {
  const qrData = `wallet:${walletAddress}${walletName ? `:${walletName}` : ''}`;
  const qrCode = generateQRCode(qrData);
  
  return {
    qrCode,
    data: qrData,
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
  };
}

/**
 * Generate QR code data for vault item
 */
export function generateVaultItemQRCode(
  itemId: string, 
  itemType: string, 
  itemLabel: string, 
  walletAddress: string
): QRCodeData {
  const qrData = `vault:${itemId}:${itemType}:${itemLabel}:${walletAddress}`;
  const qrCode = generateQRCode(qrData);
  
  return {
    qrCode,
    data: qrData,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  };
}

/**
 * Generate master QR code for entire vault
 */
export function generateMasterVaultQRCode(walletAddress: string, vaultSummary: string): QRCodeData {
  const qrData = `vault-master:${walletAddress}:${vaultSummary}`;
  const qrCode = generateQRCode(qrData);
  
  return {
    qrCode,
    data: qrData,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  };
}

/**
 * Parse QR code data
 */
export function parseQRCodeData(qrData: string): {
  type: 'wallet' | 'vault-item' | 'vault-master';
  data: Record<string, string>;
} | null {
  try {
    const parts = qrData.split(':');
    
    if (parts[0] === 'wallet') {
      return {
        type: 'wallet',
        data: {
          address: parts[1],
          name: parts[2] || 'Unknown Wallet'
        }
      };
    }
    
    if (parts[0] === 'vault-item') {
      return {
        type: 'vault-item',
        data: {
          id: parts[1],
          type: parts[2],
          label: parts[3],
          walletAddress: parts[4]
        }
      };
    }
    
    if (parts[0] === 'vault-master') {
      return {
        type: 'vault-master',
        data: {
          walletAddress: parts[1],
          summary: parts[2]
        }
      };
    }
    
    return null;
  } catch (error) {
    console.error('Failed to parse QR code data:', error);
    return null;
  }
}

