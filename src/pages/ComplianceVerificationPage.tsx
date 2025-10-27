/**
 * Compliance Verification Demo Page
 * 
 * Demo page showcasing automated compliance verification
 */

import React, { useState } from 'react';
import { ComplianceVerification } from '../components/compliance/ComplianceVerification';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  ExternalLink,
  Code,
  FileText,
  Database
} from 'lucide-react';

export const ComplianceVerificationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'demo' | 'info'>('demo');

  const exampleContracts = [
    {
      address: '0xA0b86a33E6441b8c4C8C0E4b8c4C8C0E4b8c4C8C0',
      name: 'Uniswap V3',
      chainId: 1,
      description: 'Decentralized exchange protocol'
    },
    {
      address: '0xB0b86a33E6441b8c4C8C0E4b8c4C8C0E4b8c4C8C0',
      name: 'Aave V3',
      chainId: 1,
      description: 'Lending protocol'
    },
    {
      address: '0xC0b86a33E6441b8c4C8C0E4b8c4C8C0E4b8c4C8C0',
      name: 'Compound V2',
      chainId: 1,
      description: 'Money market protocol'
    }
  ];

  const features = [
    {
      icon: <Shield className="w-6 h-6 text-blue-600" />,
      title: 'Automated Verification',
      description: 'Instantly verify contract security using multiple trusted sources'
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-green-600" />,
      title: 'Multi-Source Validation',
      description: 'Cross-reference audits from CertiK, DeFiSafety, SlowMist, and more'
    },
    {
      icon: <Database className="w-6 h-6 text-purple-600" />,
      title: 'Blockchain Explorer Integration',
      description: 'Verify contract source code on Etherscan, Polygonscan, BSCScan'
    },
    {
      icon: <AlertTriangle className="w-6 h-6 text-orange-600" />,
      title: 'Risk Assessment',
      description: 'Automated risk scoring and detailed security recommendations'
    }
  ];

  const verificationSteps = [
    {
      step: 1,
      title: 'Contract Verification',
      description: 'Check if contract source code is verified on blockchain explorer',
      weight: '30%'
    },
    {
      step: 2,
      title: 'Audit Database Lookup',
      description: 'Search trusted audit databases for security assessments',
      weight: '40%'
    },
    {
      step: 3,
      title: 'Security Score Analysis',
      description: 'Calculate security scores from multiple platforms',
      weight: '30%'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Automated Compliance Verification
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Verify smart contract security and compliance automatically using trusted audit databases, 
            blockchain explorers, and security platforms.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setActiveTab('demo')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'demo'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Code className="w-4 h-4 inline mr-2" />
              Live Demo
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'info'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Info className="w-4 h-4 inline mr-2" />
              How It Works
            </button>
          </div>
        </div>

        {/* Demo Tab */}
        {activeTab === 'demo' && (
          <div className="space-y-8">
            {/* Example Contracts */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Try These Example Contracts
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {exampleContracts.map((contract, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                    <h4 className="font-medium text-gray-900">{contract.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{contract.description}</p>
                    <p className="text-xs text-gray-500 font-mono">{contract.address}</p>
                    <Button
                      onClick={() => {
                        // This would populate the verification form
                        console.log('Verify contract:', contract.address);
                      }}
                      size="sm"
                      className="mt-3 w-full"
                    >
                      <Shield className="w-3 h-3 mr-1" />
                      Verify
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Compliance Verification Component */}
            <ComplianceVerification />
          </div>
        )}

        {/* Info Tab */}
        {activeTab === 'info' && (
          <div className="space-y-8">
            {/* Features */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Key Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        {feature.title}
                      </h4>
                      <p className="text-gray-600 text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Verification Process */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Verification Process
              </h3>
              <div className="space-y-6">
                {verificationSteps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        {step.step}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">
                          {step.title}
                        </h4>
                        <span className="text-sm text-blue-600 font-medium">
                          {step.weight}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Data Sources */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Trusted Data Sources
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Etherscan', type: 'Blockchain Explorer', status: 'Active' },
                  { name: 'Polygonscan', type: 'Blockchain Explorer', status: 'Active' },
                  { name: 'BSCScan', type: 'Blockchain Explorer', status: 'Active' },
                  { name: 'CertiK', type: 'Security Auditor', status: 'API Available' },
                  { name: 'DeFiSafety', type: 'Community Platform', status: 'API Available' },
                  { name: 'SlowMist', type: 'Security Auditor', status: 'API Available' }
                ].map((source, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{source.name}</h4>
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                        {source.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{source.type}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* API Configuration */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                API Configuration
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Required Environment Variables:
                </h4>
                <div className="space-y-2 text-sm font-mono text-gray-700">
                  <div>REACT_APP_ETHERSCAN_API_KEY=your_key_here</div>
                  <div>REACT_APP_POLYGONSCAN_API_KEY=your_key_here</div>
                  <div>REACT_APP_BSCSCAN_API_KEY=your_key_here</div>
                  <div>REACT_APP_CERTIK_API_KEY=your_key_here</div>
                  <div>REACT_APP_SLOWMIST_API_KEY=your_key_here</div>
                  <div>REACT_APP_DEFISAFETY_API_KEY=your_key_here</div>
                </div>
                <div className="mt-4">
                  <Button
                    onClick={() => window.open('https://etherscan.io/apis', '_blank')}
                    variant="outline"
                    size="sm"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Get API Keys
                  </Button>
                </div>
              </div>
            </Card>

            {/* Risk Levels */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Risk Level Interpretation
              </h3>
              <div className="space-y-4">
                {[
                  { level: 'Low Risk', score: '80-100', color: 'green', description: 'Contract appears secure with good audit scores' },
                  { level: 'Medium Risk', score: '60-79', color: 'yellow', description: 'Some security concerns identified' },
                  { level: 'High Risk', score: '40-59', color: 'orange', description: 'Significant security concerns require attention' },
                  { level: 'Critical Risk', score: '0-39', color: 'red', description: 'Immediate security intervention required' }
                ].map((risk, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className={`w-4 h-4 rounded-full bg-${risk.color}-500`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{risk.level}</span>
                        <span className="text-sm text-gray-600">{risk.score}</span>
                      </div>
                      <p className="text-sm text-gray-600">{risk.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};




