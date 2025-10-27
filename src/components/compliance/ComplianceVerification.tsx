/**
 * Compliance Verification Component
 * 
 * UI component for automated compliance verification
 */

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useComplianceVerification } from '../../hooks/useComplianceVerification';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  ExternalLink,
  RefreshCw,
  Download,
  Eye,
  Clock
} from 'lucide-react';

interface ComplianceVerificationProps {
  onVerificationComplete?: (result: any) => void;
  className?: string;
}

export const ComplianceVerification: React.FC<ComplianceVerificationProps> = ({
  onVerificationComplete,
  className = ''
}) => {
  const [contractAddress, setContractAddress] = useState('');
  const [chainId, setChainId] = useState(1);
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const {
    isLoading,
    error,
    results,
    verifyContract,
    clearResults,
    clearError,
    verificationSummary
  } = useComplianceVerification();

  const handleVerify = async () => {
    if (!contractAddress.trim()) return;
    
    clearError();
    const result = await verifyContract(contractAddress.trim(), chainId);
    onVerificationComplete?.(result);
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'medium':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Shield className="w-5 h-5 text-gray-500" />;
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getExplorerUrl = (address: string, chainId: number) => {
    switch (chainId) {
      case 1:
        return `https://etherscan.io/address/${address}`;
      case 137:
        return `https://polygonscan.com/address/${address}`;
      case 56:
        return `https://bscscan.com/address/${address}`;
      default:
        return `https://etherscan.io/address/${address}`;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Automated Compliance Verification
        </h2>
        <p className="text-gray-600">
          Verify smart contract security and compliance automatically
        </p>
      </div>

      {/* Input Form */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contract Address
            </label>
            <Input
              type="text"
              placeholder="0x..."
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Blockchain Network
            </label>
            <select
              value={chainId}
              onChange={(e) => setChainId(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>Ethereum Mainnet</option>
              <option value={137}>Polygon</option>
              <option value={56}>BSC</option>
            </select>
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={handleVerify}
              disabled={isLoading || !contractAddress.trim()}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Verifying...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Verify Contract
                </>
              )}
            </Button>

            {results.length > 0 && (
              <Button
                onClick={clearResults}
                variant="outline"
                className="px-4"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
              <Button
                onClick={clearError}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                Dismiss
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Verification Summary */}
      {results.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Verification Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {verificationSummary.total}
              </div>
              <div className="text-sm text-gray-600">Total Contracts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {verificationSummary.verified}
              </div>
              <div className="text-sm text-gray-600">Verified</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {verificationSummary.highRisk + verificationSummary.criticalRisk}
              </div>
              <div className="text-sm text-gray-600">High Risk</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {verificationSummary.avgScore}
              </div>
              <div className="text-sm text-gray-600">Avg Score</div>
            </div>
          </div>
        </Card>
      )}

      {/* Results */}
      {results.map((result) => (
        <Card key={result.contractAddress} className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              {getRiskIcon(result.riskLevel)}
              <div>
                <h3 className="font-semibold text-gray-900">
                  {formatAddress(result.contractAddress)}
                </h3>
                <p className="text-sm text-gray-600">
                  Overall Score: {result.overallScore}/100
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => setShowDetails(
                  showDetails === result.contractAddress ? null : result.contractAddress
                )}
                variant="outline"
                size="sm"
              >
                <Eye className="w-4 h-4 mr-1" />
                {showDetails === result.contractAddress ? 'Hide' : 'Details'}
              </Button>
              <Button
                onClick={() => window.open(getExplorerUrl(result.contractAddress, chainId), '_blank')}
                variant="outline"
                size="sm"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Explorer
              </Button>
            </div>
          </div>

          {/* Risk Level Badge */}
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(result.riskLevel)}`}>
            {result.riskLevel.toUpperCase()} RISK
          </div>

          {/* Contract Verification Status */}
          <div className="mt-4 flex items-center space-x-2">
            {result.checks.contractVerification.verified ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <span className="text-sm text-gray-700">
              Contract {result.checks.contractVerification.verified ? 'Verified' : 'Not Verified'}
            </span>
          </div>

          {/* Audit Results */}
          {result.checks.auditDatabases.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Audit Results:</h4>
              <div className="space-y-2">
                {result.checks.auditDatabases.map((audit, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{audit.auditor}</span>
                    <div className="flex items-center space-x-2">
                      {audit.auditStatus === 'passed' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-yellow-500" />
                      )}
                      <span className="text-gray-700">
                        {audit.auditStatus === 'passed' ? 'Passed' : 'Not Found'}
                        {audit.auditScore && ` (${audit.auditScore}/100)`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Scores */}
          {result.checks.securityScores.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Security Scores:</h4>
              <div className="space-y-2">
                {result.checks.securityScores.map((score, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{score.source}</span>
                    <div className="flex items-center space-x-2">
                      {getRiskIcon(score.riskLevel)}
                      <span className="text-gray-700">{score.score}/100</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed View */}
          {showDetails === result.contractAddress && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Recommendations:</h4>
              <ul className="space-y-2">
                {result.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                    <span>{recommendation}</span>
                  </li>
                ))}
              </ul>

              {result.requiresManualReview && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">
                      Manual Review Required
                    </span>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    This contract requires manual review by our compliance team.
                  </p>
                </div>
              )}

              <div className="mt-4 text-xs text-gray-500">
                Last checked: {new Date(result.lastChecked).toLocaleString()}
              </div>
            </div>
          )}
        </Card>
      ))}

      {/* Empty State */}
      {results.length === 0 && !isLoading && (
        <Card className="p-12 text-center">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Contracts Verified Yet
          </h3>
          <p className="text-gray-600 mb-6">
            Enter a contract address above to start automated compliance verification.
          </p>
        </Card>
      )}
    </div>
  );
};




