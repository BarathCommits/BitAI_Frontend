import React from 'react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { authService } from '../services/AuthService';
import { useTheme } from '../hooks/useTheme';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Key,
  Trash2,
  Download,
  Upload,
  Eye,
  EyeOff,
  Wallet
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [showApiKeys, setShowApiKeys] = React.useState(false);
  const { theme, setTheme } = useTheme();
  
  // Get user data from AuthService
  const user = authService.getUser();
  const walletAddress = authService.getWalletAddress() || user?.walletAddress || '0x...';
  
  // Format wallet address for display (0x1234...5678)
  const formatAddress = (address: string) => {
    if (address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Settings</h1>
        <p className="text-secondary-600">Manage your Safe preferences and account</p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-semibold text-secondary-900">Profile</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-primary-600" />
            </div>
            <div>
              <Button variant="outline" size="sm">Change Avatar</Button>
              <p className="text-sm text-secondary-600 mt-1">JPG, PNG or GIF. Max size 2MB.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Wallet Address - Primary Identifier (Read-only) */}
            <div className="md:col-span-2">
              <div className="flex items-start space-x-3 p-4 bg-primary-50 border border-primary-200 rounded-lg">
                <Wallet className="w-5 h-5 text-primary-600 mt-0.5" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Wallet Address
                  </label>
                  <code className="block text-sm text-primary-900 bg-white px-3 py-2 rounded border border-primary-300 font-mono">
                    {walletAddress}
                  </code>
                  <p className="text-xs text-primary-700 mt-1">
                    Your wallet address is your identity in Safe Browser. This cannot be changed.
                  </p>
                </div>
              </div>
            </div>
            
            <Input
              label="Username"
              defaultValue={user?.username || "bitai_user"}
              helperText="This will be visible to other users"
            />
            <Input
              label="Display Name"
              defaultValue={user?.profile?.displayName || formatAddress(walletAddress)}
              helperText="Your public display name"
            />
            <Input
              label="Bio"
              defaultValue={user?.profile?.bio || ""}
              placeholder="Tell us about yourself..."
              helperText="Optional description"
            />
            <Input
              label="Email (Optional)"
              type="email"
              defaultValue={user?.email || ""}
              placeholder="email@example.com"
              helperText="Optional - for notifications only"
            />
          </div>
          
          <div className="flex justify-end">
            <Button>Save Changes</Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-semibold text-secondary-900">Security</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-primary-50 border border-primary-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-primary-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-primary-900">Wallet-Based Security</h3>
                  <p className="text-sm text-primary-700">
                    Your account is secured by your wallet's private key. No passwords needed!
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
              <div>
                <h3 className="font-medium text-secondary-900">Session Management</h3>
                <p className="text-sm text-secondary-600">Manage your active wallet sessions</p>
              </div>
              <Button variant="outline">View Sessions</Button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
              <div>
                <h3 className="font-medium text-secondary-900">API Keys</h3>
                <p className="text-sm text-secondary-600">Manage your API access keys</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowApiKeys(!showApiKeys)}
                >
                  {showApiKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button variant="outline">Manage</Button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-secondary-200 pt-6">
            <h3 className="font-medium text-secondary-900 mb-4">Change Password</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Current Password"
                type="password"
                placeholder="Enter current password"
              />
              <Input
                label="New Password"
                type="password"
                placeholder="Enter new password"
              />
            </div>
            <div className="flex justify-end mt-4">
              <Button>Update Password</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Palette className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-semibold text-secondary-900">Appearance</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium text-secondary-900 mb-4">Theme</h3>
            <div className="grid grid-cols-2 gap-4">
              <div 
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  theme === 'light' 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-secondary-200 bg-white hover:border-primary-200'
                }`}
                onClick={() => setTheme('light')}
              >
                <div className="w-full h-16 bg-gradient-to-br from-white to-secondary-100 rounded mb-2"></div>
                <div className="text-sm font-medium text-secondary-900">Light</div>
                <div className="text-xs text-secondary-600">Default theme</div>
              </div>
              <div 
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  theme === 'dark' 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-secondary-200 bg-white hover:border-primary-200'
                }`}
                onClick={() => setTheme('dark')}
              >
                <div className="w-full h-16 bg-gradient-to-br from-secondary-800 to-secondary-900 rounded mb-2"></div>
                <div className="text-sm font-medium text-secondary-900">Dark</div>
                <div className="text-xs text-secondary-600">Easy on the eyes</div>
              </div>
              <div 
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  theme === 'auto' 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-secondary-200 bg-white hover:border-primary-200'
                }`}
                onClick={() => setTheme('auto')}
              >
                <div className="w-full h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded mb-2"></div>
                <div className="text-sm font-medium text-secondary-900">Auto</div>
                <div className="text-xs text-secondary-600">System preference</div>
              </div>
              <div 
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  theme === 'cyberpunk' 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-secondary-200 bg-white hover:border-primary-200'
                }`}
                onClick={() => setTheme('cyberpunk')}
              >
                <div className="w-full h-16 bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 rounded mb-2"></div>
                <div className="text-sm font-medium text-secondary-900">Cyberpunk</div>
                <div className="text-xs text-secondary-600">Futuristic neon theme</div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-secondary-900 mb-4">Language</h3>
            <div className="max-w-xs">
              <select className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="zh">中文</option>
                <option value="ja">日本語</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-semibold text-secondary-900">Notifications</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-secondary-900">Email Notifications</h3>
                <p className="text-sm text-secondary-600">Receive updates via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-secondary-900">Push Notifications</h3>
                <p className="text-sm text-secondary-600">Receive browser notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-secondary-900">Transaction Alerts</h3>
                <p className="text-sm text-secondary-600">Get notified about transaction status</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-secondary-900">AI Suggestions</h3>
                <p className="text-sm text-secondary-600">Receive AI-powered recommendations</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data & Privacy */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-semibold text-secondary-900">Data & Privacy</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
              <div>
                <h3 className="font-medium text-secondary-900">Export Data</h3>
                <p className="text-sm text-secondary-600">Download all your data</p>
              </div>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
              <div>
                <h3 className="font-medium text-secondary-900">Import Data</h3>
                <p className="text-sm text-secondary-600">Import data from another browser</p>
              </div>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div>
                <h3 className="font-medium text-red-900">Delete Account</h3>
                <p className="text-sm text-red-600">Permanently delete your account and all data</p>
              </div>
              <Button variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
