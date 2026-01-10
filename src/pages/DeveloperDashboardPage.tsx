import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useBuiltInWallet } from '../hooks/useBuiltInWallet';
import { 
  Code, 
  Plus, 
  TrendingUp, 
  Users, 
  Download, 
  Star,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  BarChart3,
  Package,
  Zap
} from 'lucide-react';

interface DAppSubmission {
  id: string;
  name: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  submittedAt: string;
  score?: number;
  downloads?: number;
  users?: number;
  rating?: number;
}

export const DeveloperDashboardPage: React.FC = () => {
  const [submissions] = useState<DAppSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { connectedWallets } = useBuiltInWallet();
  const theme = connectedWallets.length > 0 ? 'cyberpunk' : 'modern';

  // Fetch submissions from API
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
        const token = localStorage.getItem('authToken');
        
        const response = await fetch(`${API_URL}/api/v1/developer/submissions`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          // setSubmissions(data.data || []); // Uncomment when backend is ready
        }
      } catch (error) {
        console.error('Failed to fetch submissions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  const stats = {
    totalSubmissions: submissions.length,
    approved: submissions.filter(s => s.status === 'approved').length,
    pending: submissions.filter(s => s.status === 'pending').length,
    totalDownloads: submissions.reduce((sum, s) => sum + (s.downloads || 0), 0),
    avgRating: submissions.length > 0 
      ? submissions.reduce((sum, s) => sum + (s.rating || 0), 0) / submissions.filter(s => s.rating).length 
      : 0
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'under_review':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      approved: theme === 'cyberpunk' ? 'bg-green-500/20 text-green-400 border border-green-400/50' : 'bg-green-100 text-green-700',
      rejected: theme === 'cyberpunk' ? 'bg-red-500/20 text-red-400 border border-red-400/50' : 'bg-red-100 text-red-700',
      under_review: theme === 'cyberpunk' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/50' : 'bg-yellow-100 text-yellow-700',
      pending: theme === 'cyberpunk' ? 'bg-blue-500/20 text-blue-400 border border-blue-400/50' : 'bg-blue-100 text-blue-700'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
        theme === 'cyberpunk' ? 'cyberpunk-font' : ''
      } ${styles[status as keyof typeof styles]}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      theme === 'cyberpunk' 
        ? 'cyberpunk-theme' 
        : 'bg-secondary-50'
    }`}>
      {/* Hero Section */}
      <section className={`text-white py-12 transition-all duration-500 ${
        theme === 'cyberpunk' 
          ? 'cyberpunk-card' 
          : 'bg-gradient-to-r from-primary-600 to-accent-600'
      }`}>
        <div className="container mx-auto px-6">
          <div>
            <h1 className={`text-4xl font-bold mb-2 transition-all duration-300 ${
              theme === 'cyberpunk' 
                ? 'cyberpunk-gradient-text cyberpunk-font' 
                : ''
            }`}>
              {theme === 'cyberpunk' ? 'SAFE DEVELOPER HUB' : 'Developer Dashboard'}
            </h1>
            <p className={`text-lg transition-all duration-300 ${
              theme === 'cyberpunk' 
                ? 'text-white/90 cyberpunk-font' 
                : 'text-white/90'
            }`}>
              {theme === 'cyberpunk' 
                ? 'Manage Safe module submissions and system performance' 
                : 'Manage your dApp submissions and track performance'}
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-secondary-900">Overview</h2>
          <Link to="/developer/submit">
            <Button
              size="lg"
              leftIcon={<Plus className="w-5 h-5" />}
            >
              Submit New dApp
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className={theme === 'cyberpunk' ? 'cyberpunk-card' : ''}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm mb-1 transition-all duration-300 ${
                    theme === 'cyberpunk' 
                      ? 'text-white/80 cyberpunk-font' 
                      : 'text-secondary-600'
                  }`}>
                    {theme === 'cyberpunk' ? 'TOTAL SAFE SUBMISSIONS' : 'Total Submissions'}
                  </p>
                  <p className={`text-3xl font-bold transition-all duration-300 ${
                    theme === 'cyberpunk' 
                      ? 'text-white cyberpunk-font' 
                      : 'text-secondary-900'
                  }`}>{stats.totalSubmissions}</p>
                </div>
                <div className={`p-3 rounded-lg transition-all duration-300 ${
                  theme === 'cyberpunk' 
                    ? 'bg-blue-500/20' 
                    : 'bg-blue-100'
                }`}>
                  <Package className={`w-6 h-6 transition-all duration-300 ${
                    theme === 'cyberpunk' 
                      ? 'text-blue-400' 
                      : 'text-blue-600'
                  }`} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={theme === 'cyberpunk' ? 'cyberpunk-card' : ''}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm mb-1 transition-all duration-300 ${
                    theme === 'cyberpunk' 
                      ? 'text-white/80 cyberpunk-font' 
                      : 'text-secondary-600'
                  }`}>
                    {theme === 'cyberpunk' ? 'Apps APPROVED' : 'Approved'}
                  </p>
                  <p className={`text-3xl font-bold transition-all duration-300 ${
                    theme === 'cyberpunk' 
                      ? 'text-green-400 cyberpunk-font' 
                      : 'text-green-600'
                  }`}>{stats.approved}</p>
                </div>
                <div className={`p-3 rounded-lg transition-all duration-300 ${
                  theme === 'cyberpunk' 
                    ? 'bg-green-500/20' 
                    : 'bg-green-100'
                }`}>
                  <CheckCircle className={`w-6 h-6 transition-all duration-300 ${
                    theme === 'cyberpunk' 
                      ? 'text-green-400' 
                      : 'text-green-600'
                  }`} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={theme === 'cyberpunk' ? 'cyberpunk-card' : ''}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm mb-1 transition-all duration-300 ${
                    theme === 'cyberpunk' 
                      ? 'text-white/80 cyberpunk-font' 
                      : 'text-secondary-600'
                  }`}>
                    {theme === 'cyberpunk' ? 'Apps Pending' : 'Pending'}
                  </p>
                  <p className={`text-3xl font-bold transition-all duration-300 ${
                    theme === 'cyberpunk' 
                      ? 'text-yellow-400 cyberpunk-font' 
                      : 'text-yellow-600'
                  }`}>{stats.pending}</p>
                </div>
                <div className={`p-3 rounded-lg transition-all duration-300 ${
                  theme === 'cyberpunk' 
                    ? 'bg-yellow-500/20' 
                    : 'bg-yellow-100'
                }`}>
                  <Clock className={`w-6 h-6 transition-all duration-300 ${
                    theme === 'cyberpunk' 
                      ? 'text-yellow-400' 
                      : 'text-yellow-600'
                  }`} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={theme === 'cyberpunk' ? 'cyberpunk-card' : ''}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm mb-1 transition-all duration-300 ${
                    theme === 'cyberpunk' 
                      ? 'text-white/80 cyberpunk-font' 
                      : 'text-secondary-600'
                  }`}>
                    {theme === 'cyberpunk' ? 'App Rating' : 'Avg Rating'}
                  </p>
                  <p className={`text-3xl font-bold transition-all duration-300 ${
                    theme === 'cyberpunk' 
                      ? 'text-white cyberpunk-font' 
                      : 'text-secondary-900'
                  }`}>{stats.avgRating}</p>
                </div>
                <div className={`p-3 rounded-lg transition-all duration-300 ${
                  theme === 'cyberpunk' 
                    ? 'bg-yellow-500/20' 
                    : 'bg-yellow-100'
                }`}>
                  <Star className={`w-6 h-6 transition-all duration-300 ${
                    theme === 'cyberpunk' 
                      ? 'text-yellow-400' 
                      : 'text-yellow-600'
                  }`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link to="/developer/submit">
            <Card hover className={`cursor-pointer h-full transition-all duration-300 ${
              theme === 'cyberpunk' ? 'cyberpunk-card' : ''
            }`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg transition-all duration-300 ${
                    theme === 'cyberpunk' 
                      ? 'bg-blue-500/20' 
                      : 'bg-primary-100'
                  }`}>
                    <Code className={`w-6 h-6 transition-all duration-300 ${
                      theme === 'cyberpunk' 
                        ? 'text-blue-400' 
                        : 'text-primary-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className={`font-semibold mb-1 transition-all duration-300 ${
                      theme === 'cyberpunk' 
                        ? 'text-white cyberpunk-font' 
                        : 'text-secondary-900'
                    }`}>
                      {theme === 'cyberpunk' ? 'SUBMIT WITH BIT SDK' : 'Submit with SDK'}
                    </h3>
                    <p className={`text-sm transition-all duration-300 ${
                      theme === 'cyberpunk' 
                        ? 'text-white/80 cyberpunk-font' 
                        : 'text-secondary-600'
                    }`}>
                      {theme === 'cyberpunk' 
                        ? 'Use our Bit SDK for instant validation and faster Bit approval' 
                        : 'Use our SDK for instant validation and faster approval'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/sdk">
            <Card hover className={`cursor-pointer h-full transition-all duration-300 ${
              theme === 'cyberpunk' ? 'cyberpunk-card' : ''
            }`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg transition-all duration-300 ${
                    theme === 'cyberpunk' 
                      ? 'bg-green-500/20' 
                      : 'bg-green-100'
                  }`}>
                    <Package className={`w-6 h-6 transition-all duration-300 ${
                      theme === 'cyberpunk' 
                        ? 'text-green-400' 
                        : 'text-green-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className={`font-semibold mb-1 transition-all duration-300 ${
                      theme === 'cyberpunk' 
                        ? 'text-white cyberpunk-font' 
                        : 'text-secondary-900'
                    }`}>
                      {theme === 'cyberpunk' ? 'BIT SDK DATABASE' : 'SDK Documentation'}
                    </h3>
                    <p className={`text-sm transition-all duration-300 ${
                      theme === 'cyberpunk' 
                        ? 'text-white/80 cyberpunk-font' 
                        : 'text-secondary-600'
                    }`}>
                      {theme === 'cyberpunk' 
                        ? 'Access Safe integration guides for 50+ programming languages' 
                        : 'View integration guides for 50+ programming languages'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Submissions List */}
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-bold text-secondary-900">Your Submissions</h2>
          </CardHeader>
          <CardContent>
            {submissions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-secondary-400" />
                </div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                  No submissions yet
                </h3>
                <p className="text-secondary-600 mb-6">
                  Submit your first dApp using our SDK for instant validation
                </p>
                <Link to="/developer/submit">
                  <Button leftIcon={<Plus className="w-4 h-4" />}>
                    Submit Your First dApp
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map(submission => (
                  <div
                    key={submission.id}
                    className="border border-secondary-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(submission.status)}
                          <h3 className="text-lg font-semibold text-secondary-900">
                            {submission.name}
                          </h3>
                          {getStatusBadge(submission.status)}
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm text-secondary-600 mb-3">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>Submitted {submission.submittedAt}</span>
                          </div>
                          {submission.score && (
                            <div className="flex items-center gap-1">
                              <Zap className="w-4 h-4 text-yellow-600" />
                              <span className="font-medium">Score: {submission.score}/100</span>
                            </div>
                          )}
                        </div>

                        {submission.status === 'approved' && (
                          <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-1 text-secondary-700">
                              <Download className="w-4 h-4" />
                              <span>{submission.downloads} downloads</span>
                            </div>
                            <div className="flex items-center gap-1 text-secondary-700">
                              <Users className="w-4 h-4" />
                              <span>{submission.users} users</span>
                            </div>
                            <div className="flex items-center gap-1 text-secondary-700">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span>{submission.rating}/5</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Link to={`/developer/submissions/${submission.id}`}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                        {submission.status === 'approved' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`/bit-store?app=${submission.id}`, '_blank')}
                            leftIcon={<ExternalLink className="w-4 h-4" />}
                          >
                            View in Store
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default DeveloperDashboardPage;

