import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { useBuiltInWallet } from '../hooks/useBuiltInWallet';
import { useTheme } from '../hooks/useTheme';
import { 
  MessageSquare, 
  Store, 
  Zap, 
  Shield, 
  Globe,
  ArrowRight,
  Users,
  Star
} from 'lucide-react';

export const HomePage: React.FC = () => {
  // Wallet connection status
  const { connectedWallets } = useBuiltInWallet();
  const { theme, isCyberpunk } = useTheme();
  const features = [
    {
      icon: MessageSquare,
      title: 'AI Chat Assistant',
      description: 'Get instant help with Web3 operations through our hybrid AI system.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Store,
      title: 'Bit AppStore',
      description: 'Discover and upload secure decentralized applications.',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: Shield,
      title: 'Safe Vault',
      description: 'Securely store your personal information with end-to-end encryption.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: Globe,
      title: 'Web3 Explorer',
      description: 'Navigate the decentralized web with confidence and security.',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  const stats = [
    { label: 'Active Users', value: '10,000+', icon: Users },
    { label: 'AppStore Apps', value: '500+', icon: Globe },
    { label: 'AI Interactions', value: '1M+', icon: MessageSquare },
    { label: 'User Rating', value: '4.8/5', icon: Star },
  ];

  const recentDApps = [
    {
      name: 'Uniswap',
      category: 'DeFi',
      description: 'Decentralized exchange for trading tokens',
      users: '500K',
      rating: 4.8,
      logo: '🦄',
    },
    {
      name: 'OpenSea',
      category: 'NFT',
      description: 'NFT marketplace for digital assets',
      users: '200K',
      rating: 4.5,
      logo: '🌊',
    },
    {
      name: 'Aave',
      category: 'DeFi',
      description: 'Lending and borrowing protocol',
      users: '300K',
      rating: 4.7,
      logo: '👻',
    },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className={`text-center py-16 rounded-lg transition-all duration-500 ${
        isCyberpunk 
          ? 'cyberpunk-card' 
          : 'blue-purple-gradient-bg'
      }`}>
        <div className="max-w-4xl mx-auto">
          <h1 className={`text-4xl md:text-6xl font-bold mb-6 ${
            isCyberpunk 
              ? 'cyberpunk-font cyberpunk-gradient-text cyberpunk-text-glow' 
              : 'text-secondary-900'
          }`}>
            {isCyberpunk ? 'SAFE AI THE FUTURE OF WEB3' : 'Welcome to the Future of Web3'}
          </h1>
          <p className={`text-xl mb-8 max-w-2xl mx-auto ${
            isCyberpunk 
              ? 'text-white/90' 
              : 'text-secondary-600'
          }`}>
            {isCyberpunk 
              ? 'Safe pathways established. Decentralized applications now accessible through advanced AI interface. Welcome to the cyberpunk future of Web3.'
              : 'Combining the power of AI with Web3 technology to make decentralized applications accessible, secure, and easy to use.'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button size="lg" className={`transition-all duration-300 ${
                isCyberpunk ? 'cyberpunk-button' : ''
              }`}>
                <MessageSquare className="w-5 h-5 mr-2" />
                {isCyberpunk ? 'INITIATE SAFE CHAT' : 'Start AI Chat'}
              </Button>
            </Link>
            <Link to="/safe-store">
              <Button variant="outline" size="lg" className={`transition-all duration-300 ${
                isCyberpunk 
                  ? 'cyberpunk-button border-green-400/50 text-green-400 hover:border-green-400 hover:text-white' 
                  : ''
              }`}>
                <Store className="w-5 h-5 mr-2" />
                {isCyberpunk ? 'ACCESS BIT APPSTORE' : 'Explore Bit AppStore'}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={`py-12 rounded-lg shadow-sm transition-all duration-500 ${
        isCyberpunk 
          ? 'cyberpunk-card' 
          : 'bg-white'
      }`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="flex justify-center mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  isCyberpunk 
                    ? 'cyberpunk-gradient-bg cyberpunk-text-glow' 
                    : 'bg-primary-100'
                }`}>
                  <stat.icon className={`w-6 h-6 ${
                    isCyberpunk 
                      ? 'text-white' 
                      : 'text-primary-600'
                  }`} />
                </div>
              </div>
              <div className={`text-2xl font-bold mb-1 ${
                isCyberpunk 
                  ? 'cyberpunk-font cyberpunk-gradient-text cyberpunk-text-glow' 
                  : 'text-secondary-900'
              }`}>
                {stat.value}
              </div>
              <div className={`text-sm ${
                isCyberpunk 
                  ? 'text-white/80 cyberpunk-font' 
                  : 'text-secondary-600'
              }`}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section>
        <div className="text-center mb-12">
          <h2 className={`text-3xl font-bold mb-4 ${
            isCyberpunk 
              ? 'cyberpunk-font cyberpunk-gradient-text cyberpunk-text-glow' 
              : 'text-secondary-900'
          }`}>
            {isCyberpunk ? 'SAFE CAPABILITIES' : 'Powerful Features'}
          </h2>
          <p className={`text-lg max-w-2xl mx-auto ${
            isCyberpunk 
              ? 'text-white/90' 
              : 'text-secondary-600'
          }`}>
            {isCyberpunk 
              ? 'Advanced Safe pathways for secure Web3 navigation and AI-enhanced interactions.'
              : 'Everything you need to navigate the Web3 ecosystem safely and efficiently.'
            }
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} hover className={`text-center transition-all duration-500 ${
              isCyberpunk ? 'cyberpunk-card' : ''
            }`}>
              <CardContent className="pt-6">
                <div className={`w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4 transition-all duration-300 ${
                  isCyberpunk 
                    ? 'cyberpunk-gradient-bg cyberpunk-text-glow' 
                    : feature.bgColor
                }`}>
                  <feature.icon className={`w-8 h-8 ${
                    isCyberpunk 
                      ? 'text-white' 
                      : feature.color
                  }`} />
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${
                  isCyberpunk 
                    ? 'cyberpunk-font text-white cyberpunk-text-glow' 
                    : 'text-secondary-900'
                }`}>
                  {feature.title}
                </h3>
                <p className={`text-sm ${
                  isCyberpunk 
                    ? 'text-white/80' 
                    : 'text-secondary-600'
                }`}>
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Popular dApps Section */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-secondary-900 mb-2">
              Popular dApps
            </h2>
            <p className="text-secondary-600">
              Discover the most trusted decentralized applications
            </p>
          </div>
          <Link to="/safe-store">
            <Button variant="outline">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentDApps.map((dapp) => (
            <Card key={dapp.name} hover>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{dapp.logo}</div>
                  <div>
                    <h3 className="font-semibold text-secondary-900">
                      {dapp.name}
                    </h3>
                    <p className="text-sm text-secondary-600">
                      {dapp.category}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-secondary-600 text-sm mb-4">
                  {dapp.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-secondary-500">
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {dapp.users}
                    </span>
                    <span className="flex items-center">
                      <Star className="w-4 h-4 mr-1" />
                      {dapp.rating}
                    </span>
                  </div>
                  <Button size="sm" variant="outline">
                    Connect
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className={`rounded-lg p-8 text-center text-white transition-all duration-500 ${
        isCyberpunk 
          ? 'cyberpunk-card' 
          : 'bg-gradient-to-r from-primary-600 to-accent-600'
      }`}>
        <h2 className={`text-3xl font-bold mb-4 transition-all duration-300 ${
          isCyberpunk ? 'cyberpunk-font cyberpunk-gradient-text' : ''
        }`}>
          {isCyberpunk ? 'READY TO ENTER THE SAFE MATRIX?' : 'Ready to Explore Web3?'}
        </h2>
        <p className={`text-xl mb-6 transition-all duration-300 ${
          isCyberpunk 
            ? 'text-white/90 cyberpunk-font' 
            : 'opacity-90'
        }`}>
          {isCyberpunk 
            ? 'Join thousands of Safe users who are already navigating the decentralized matrix.' 
            : 'Join thousands of users who are already navigating the decentralized web.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/chat">
            <Button size="lg" variant="secondary" className={isCyberpunk ? 'cyberpunk-button' : ''}>
              <Zap className="w-5 h-5 mr-2" />
              {isCyberpunk ? 'INITIATE SAFE LINK' : 'Get Started'}
            </Button>
          </Link>
          <Button 
            size="lg" 
            variant="outline" 
            className={`transition-all duration-300 ${
              isCyberpunk 
                ? 'cyberpunk-button border-green-400/50 text-green-400 hover:bg-green-500/20 hover:text-green-300' 
                : 'border-white text-white hover:bg-white hover:text-primary-600'
            }`}
          >
            {isCyberpunk ? 'ACCESS SAFE DATABASE' : 'Learn More'}
          </Button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
