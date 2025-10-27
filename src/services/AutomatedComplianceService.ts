/**
 * Automated Compliance Verification Service
 * 
 * Provides automated compliance checking for smart contracts and dApps
 */

export interface ContractVerificationResult {
  contractAddress: string;
  verified: boolean;
  compilerVersion?: string;
  license?: string;
  sourceCode?: string;
  abi?: any[];
  proxy?: boolean;
  implementation?: string;
}

export interface AuditDatabaseResult {
  auditor: string;
  auditDate?: string;
  auditStatus: 'passed' | 'failed' | 'pending' | 'not-found';
  auditScore?: number;
  auditReportUrl?: string;
  findings?: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface SecurityScoreResult {
  source: string;
  score: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  lastUpdated: string;
  details?: string;
}

export interface ComplianceVerificationResult {
  contractAddress: string;
  overallScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  verified: boolean;
  checks: {
    contractVerification: ContractVerificationResult;
    auditDatabases: AuditDatabaseResult[];
    securityScores: SecurityScoreResult[];
  };
  recommendations: string[];
  requiresManualReview: boolean;
  lastChecked: string;
}

class AutomatedComplianceService {
  private readonly API_ENDPOINTS = {
    etherscan: 'https://api.etherscan.io/api',
    polygonscan: 'https://api.polygonscan.com/api',
    bscscan: 'https://api.bscscan.com/api',
    defisafety: 'https://api.defisafety.com/v1',
    certik: 'https://api.certik.com/v1',
    slowmist: 'https://api.slowmist.com/v1'
  };

  private readonly API_KEYS = {
    etherscan: process.env.REACT_APP_ETHERSCAN_API_KEY || '',
    polygonscan: process.env.REACT_APP_POLYGONSCAN_API_KEY || '',
    bscscan: process.env.REACT_APP_BSCSCAN_API_KEY || '',
    defisafety: process.env.REACT_APP_DEFISAFETY_API_KEY || '',
    certik: process.env.REACT_APP_CERTIK_API_KEY || '',
    slowmist: process.env.REACT_APP_SLOWMIST_API_KEY || ''
  };

  /**
   * Main verification method - checks contract compliance automatically
   */
  public async verifyContract(contractAddress: string, chainId: number = 1): Promise<ComplianceVerificationResult> {
    console.log(`🔍 Starting automated compliance verification for ${contractAddress}`);
    
    try {
      // Run all checks in parallel
      const [contractVerification, auditResults, securityScores] = await Promise.allSettled([
        this.checkContractVerification(contractAddress, chainId),
        this.checkAuditDatabases(contractAddress),
        this.checkSecurityScores(contractAddress)
      ]);

      // Process results
      const contractCheck = contractVerification.status === 'fulfilled' ? contractVerification.value : null;
      const audits = auditResults.status === 'fulfilled' ? auditResults.value : [];
      const scores = securityScores.status === 'fulfilled' ? securityScores.value : [];

      // Calculate overall compliance score
      const overallScore = this.calculateOverallScore(contractCheck, audits, scores);
      const riskLevel = this.determineRiskLevel(overallScore, audits, scores);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(contractCheck, audits, scores, riskLevel);

      const result: ComplianceVerificationResult = {
        contractAddress,
        overallScore,
        riskLevel,
        verified: contractCheck?.verified || false,
        checks: {
          contractVerification: contractCheck || {
            contractAddress,
            verified: false
          },
          auditDatabases: audits,
          securityScores: scores
        },
        recommendations,
        requiresManualReview: riskLevel === 'critical' || riskLevel === 'high',
        lastChecked: new Date().toISOString()
      };

      console.log(`✅ Compliance verification completed for ${contractAddress}:`, result);
      return result;

    } catch (error) {
      console.error(`❌ Compliance verification failed for ${contractAddress}:`, error);
      return {
        contractAddress,
        overallScore: 0,
        riskLevel: 'critical',
        verified: false,
        checks: {
          contractVerification: { contractAddress, verified: false },
          auditDatabases: [],
          securityScores: []
        },
        recommendations: ['Manual review required due to verification failure'],
        requiresManualReview: true,
        lastChecked: new Date().toISOString()
      };
    }
  }

  /**
   * Check contract verification status on blockchain explorer
   */
  private async checkContractVerification(contractAddress: string, chainId: number): Promise<ContractVerificationResult> {
    try {
      let apiUrl: string;
      let apiKey: string;

      // Determine which explorer to use based on chain
      switch (chainId) {
        case 1: // Ethereum
          apiUrl = this.API_ENDPOINTS.etherscan;
          apiKey = this.API_KEYS.etherscan;
          break;
        case 137: // Polygon
          apiUrl = this.API_ENDPOINTS.polygonscan;
          apiKey = this.API_KEYS.polygonscan;
          break;
        case 56: // BSC
          apiUrl = this.API_ENDPOINTS.bscscan;
          apiKey = this.API_KEYS.bscscan;
          break;
        default:
          apiUrl = this.API_ENDPOINTS.etherscan;
          apiKey = this.API_KEYS.etherscan;
      }

      const response = await fetch(
        `${apiUrl}?module=contract&action=getsourcecode&address=${contractAddress}&apikey=${apiKey}`
      );

      if (!response.ok) {
        throw new Error(`Explorer API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.status !== '1' || !data.result || data.result.length === 0) {
        return {
          contractAddress,
          verified: false
        };
      }

      const contract = data.result[0];
      const isVerified = contract.SourceCode && contract.SourceCode !== '';

      return {
        contractAddress,
        verified: isVerified,
        compilerVersion: contract.CompilerVersion,
        license: contract.LicenseType,
        sourceCode: isVerified ? contract.SourceCode : undefined,
        abi: contract.ABI ? JSON.parse(contract.ABI) : undefined,
        proxy: contract.Proxy === '1',
        implementation: contract.Implementation
      };

    } catch (error) {
      console.warn(`Contract verification check failed for ${contractAddress}:`, error);
      return {
        contractAddress,
        verified: false
      };
    }
  }

  /**
   * Check multiple audit databases for the contract
   */
  private async checkAuditDatabases(contractAddress: string): Promise<AuditDatabaseResult[]> {
    const auditChecks = await Promise.allSettled([
      this.checkCertiKDatabase(contractAddress),
      this.checkDeFiSafetyDatabase(contractAddress),
      this.checkSlowMistDatabase(contractAddress)
    ]);

    return auditChecks
      .filter(result => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<AuditDatabaseResult>).value);
  }

  /**
   * Check CertiK audit database
   */
  private async checkCertiKDatabase(contractAddress: string): Promise<AuditDatabaseResult> {
    try {
      if (!this.API_KEYS.certik) {
        return { auditor: 'CertiK', auditStatus: 'not-found' };
      }

      const response = await fetch(
        `${this.API_ENDPOINTS.certik}/audit/${contractAddress}`,
        {
          headers: {
            'Authorization': `Bearer ${this.API_KEYS.certik}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        return { auditor: 'CertiK', auditStatus: 'not-found' };
      }

      const data = await response.json();
      
      return {
        auditor: 'CertiK',
        auditDate: data.auditDate,
        auditStatus: data.status === 'completed' ? 'passed' : 'pending',
        auditScore: data.securityScore,
        auditReportUrl: data.reportUrl,
        findings: data.findings ? {
          critical: data.findings.critical || 0,
          high: data.findings.high || 0,
          medium: data.findings.medium || 0,
          low: data.findings.low || 0
        } : undefined
      };

    } catch (error) {
      console.warn(`CertiK check failed for ${contractAddress}:`, error);
      return { auditor: 'CertiK', auditStatus: 'not-found' };
    }
  }

  /**
   * Check DeFiSafety database
   */
  private async checkDeFiSafetyDatabase(contractAddress: string): Promise<AuditDatabaseResult> {
    try {
      const response = await fetch(
        `${this.API_ENDPOINTS.defisafety}/project/${contractAddress}`
      );

      if (!response.ok) {
        return { auditor: 'DeFiSafety', auditStatus: 'not-found' };
      }

      const data = await response.json();
      
      return {
        auditor: 'DeFiSafety',
        auditDate: data.lastAuditDate,
        auditStatus: data.auditStatus === 'passed' ? 'passed' : 'pending',
        auditScore: data.securityScore,
        auditReportUrl: data.auditReportUrl,
        findings: data.findings ? {
          critical: data.findings.critical || 0,
          high: data.findings.high || 0,
          medium: data.findings.medium || 0,
          low: data.findings.low || 0
        } : undefined
      };

    } catch (error) {
      console.warn(`DeFiSafety check failed for ${contractAddress}:`, error);
      return { auditor: 'DeFiSafety', auditStatus: 'not-found' };
    }
  }

  /**
   * Check SlowMist database
   */
  private async checkSlowMistDatabase(contractAddress: string): Promise<AuditDatabaseResult> {
    try {
      if (!this.API_KEYS.slowmist) {
        return { auditor: 'SlowMist', auditStatus: 'not-found' };
      }

      const response = await fetch(
        `${this.API_ENDPOINTS.slowmist}/audit/${contractAddress}`,
        {
          headers: {
            'Authorization': `Bearer ${this.API_KEYS.slowmist}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        return { auditor: 'SlowMist', auditStatus: 'not-found' };
      }

      const data = await response.json();
      
      return {
        auditor: 'SlowMist',
        auditDate: data.auditDate,
        auditStatus: data.status === 'completed' ? 'passed' : 'pending',
        auditScore: data.securityScore,
        auditReportUrl: data.reportUrl,
        findings: data.findings ? {
          critical: data.findings.critical || 0,
          high: data.findings.high || 0,
          medium: data.findings.medium || 0,
          low: data.findings.low || 0
        } : undefined
      };

    } catch (error) {
      console.warn(`SlowMist check failed for ${contractAddress}:`, error);
      return { auditor: 'SlowMist', auditStatus: 'not-found' };
    }
  }

  /**
   * Check security scores from multiple sources
   */
  private async checkSecurityScores(contractAddress: string): Promise<SecurityScoreResult[]> {
    const scoreChecks = await Promise.allSettled([
      this.getDeFiSafetyScore(contractAddress),
      this.getCertiKSecurityScore(contractAddress)
    ]);

    return scoreChecks
      .filter(result => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<SecurityScoreResult>).value);
  }

  /**
   * Get DeFiSafety security score
   */
  private async getDeFiSafetyScore(contractAddress: string): Promise<SecurityScoreResult> {
    try {
      const response = await fetch(
        `${this.API_ENDPOINTS.defisafety}/score/${contractAddress}`
      );

      if (!response.ok) {
        return {
          source: 'DeFiSafety',
          score: 0,
          riskLevel: 'critical',
          lastUpdated: new Date().toISOString()
        };
      }

      const data = await response.json();
      const score = data.overallScore || 0;
      
      return {
        source: 'DeFiSafety',
        score,
        riskLevel: this.scoreToRiskLevel(score),
        lastUpdated: data.lastUpdated || new Date().toISOString(),
        details: data.details
      };

    } catch (error) {
      console.warn(`DeFiSafety score check failed for ${contractAddress}:`, error);
      return {
        source: 'DeFiSafety',
        score: 0,
        riskLevel: 'critical',
        lastUpdated: new Date().toISOString()
      };
    }
  }

  /**
   * Get CertiK security score
   */
  private async getCertiKSecurityScore(contractAddress: string): Promise<SecurityScoreResult> {
    try {
      if (!this.API_KEYS.certik) {
        return {
          source: 'CertiK',
          score: 0,
          riskLevel: 'critical',
          lastUpdated: new Date().toISOString()
        };
      }

      const response = await fetch(
        `${this.API_ENDPOINTS.certik}/security-score/${contractAddress}`,
        {
          headers: {
            'Authorization': `Bearer ${this.API_KEYS.certik}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        return {
          source: 'CertiK',
          score: 0,
          riskLevel: 'critical',
          lastUpdated: new Date().toISOString()
        };
      }

      const data = await response.json();
      const score = data.securityScore || 0;
      
      return {
        source: 'CertiK',
        score,
        riskLevel: this.scoreToRiskLevel(score),
        lastUpdated: data.lastUpdated || new Date().toISOString(),
        details: data.details
      };

    } catch (error) {
      console.warn(`CertiK score check failed for ${contractAddress}:`, error);
      return {
        source: 'CertiK',
        score: 0,
        riskLevel: 'critical',
        lastUpdated: new Date().toISOString()
      };
    }
  }

  /**
   * Calculate overall compliance score
   */
  private calculateOverallScore(
    contractCheck: ContractVerificationResult | null,
    audits: AuditDatabaseResult[],
    scores: SecurityScoreResult[]
  ): number {
    let totalScore = 0;
    let weightSum = 0;

    // Contract verification weight: 30%
    if (contractCheck) {
      totalScore += contractCheck.verified ? 30 : 0;
      weightSum += 30;
    }

    // Audit results weight: 40%
    if (audits.length > 0) {
      const auditScore = audits.reduce((sum, audit) => {
        if (audit.auditStatus === 'passed') {
          return sum + (audit.auditScore || 80); // Default score if not provided
        }
        return sum;
      }, 0) / audits.length;
      
      totalScore += (auditScore / 100) * 40;
      weightSum += 40;
    }

    // Security scores weight: 30%
    if (scores.length > 0) {
      const avgSecurityScore = scores.reduce((sum, score) => sum + score.score, 0) / scores.length;
      totalScore += (avgSecurityScore / 100) * 30;
      weightSum += 30;
    }

    return weightSum > 0 ? Math.round(totalScore) : 0;
  }

  /**
   * Determine risk level based on scores and findings
   */
  private determineRiskLevel(
    overallScore: number,
    audits: AuditDatabaseResult[],
    scores: SecurityScoreResult[]
  ): 'low' | 'medium' | 'high' | 'critical' {
    // Check for critical findings
    const hasCriticalFindings = audits.some(audit => 
      audit.findings && audit.findings.critical > 0
    );

    if (hasCriticalFindings) {
      return 'critical';
    }

    // Check for high findings
    const hasHighFindings = audits.some(audit => 
      audit.findings && audit.findings.high > 0
    );

    if (hasHighFindings) {
      return 'high';
    }

    // Use overall score
    if (overallScore >= 80) return 'low';
    if (overallScore >= 60) return 'medium';
    if (overallScore >= 40) return 'high';
    return 'critical';
  }

  /**
   * Convert score to risk level
   */
  private scoreToRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 80) return 'low';
    if (score >= 60) return 'medium';
    if (score >= 40) return 'high';
    return 'critical';
  }

  /**
   * Generate recommendations based on verification results
   */
  private generateRecommendations(
    contractCheck: ContractVerificationResult | null,
    audits: AuditDatabaseResult[],
    scores: SecurityScoreResult[],
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
  ): string[] {
    const recommendations: string[] = [];

    // Contract verification recommendations
    if (!contractCheck?.verified) {
      recommendations.push('Contract source code is not verified on blockchain explorer');
      recommendations.push('Consider verifying contract source code for transparency');
    }

    // Audit recommendations
    const passedAudits = audits.filter(audit => audit.auditStatus === 'passed');
    if (passedAudits.length === 0) {
      recommendations.push('No security audits found - consider getting professional audit');
    }

    // Critical findings
    const criticalFindings = audits.reduce((sum, audit) => 
      sum + (audit.findings?.critical || 0), 0
    );
    if (criticalFindings > 0) {
      recommendations.push(`${criticalFindings} critical security findings need immediate attention`);
    }

    // High findings
    const highFindings = audits.reduce((sum, audit) => 
      sum + (audit.findings?.high || 0), 0
    );
    if (highFindings > 0) {
      recommendations.push(`${highFindings} high severity findings should be addressed`);
    }

    // Risk level recommendations
    switch (riskLevel) {
      case 'critical':
        recommendations.push('CRITICAL RISK: Immediate security intervention required');
        recommendations.push('Consider pausing contract operations until issues are resolved');
        break;
      case 'high':
        recommendations.push('HIGH RISK: Significant security concerns identified');
        recommendations.push('Schedule additional security audits');
        break;
      case 'medium':
        recommendations.push('MEDIUM RISK: Some security concerns identified');
        recommendations.push('Implement security best practices');
        break;
      case 'low':
        recommendations.push('LOW RISK: Contract appears secure');
        recommendations.push('Continue regular security monitoring');
        break;
    }

    // Score-based recommendations
    const avgScore = scores.length > 0 ? 
      scores.reduce((sum, score) => sum + score.score, 0) / scores.length : 0;
    
    if (avgScore < 50) {
      recommendations.push('Security scores are low - consider comprehensive security review');
    }

    return recommendations;
  }

  /**
   * Batch verify multiple contracts
   */
  public async batchVerifyContracts(
    contracts: Array<{ address: string; chainId?: number }>
  ): Promise<ComplianceVerificationResult[]> {
    console.log(`🔄 Starting batch verification for ${contracts.length} contracts`);
    
    const results = await Promise.allSettled(
      contracts.map(contract => 
        this.verifyContract(contract.address, contract.chainId || 1)
      )
    );

    return results
      .filter(result => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<ComplianceVerificationResult>).value);
  }

  /**
   * Get verification status summary
   */
  public getVerificationSummary(results: ComplianceVerificationResult[]): {
    total: number;
    verified: number;
    lowRisk: number;
    mediumRisk: number;
    highRisk: number;
    criticalRisk: number;
    avgScore: number;
  } {
    const total = results.length;
    const verified = results.filter(r => r.verified).length;
    const lowRisk = results.filter(r => r.riskLevel === 'low').length;
    const mediumRisk = results.filter(r => r.riskLevel === 'medium').length;
    const highRisk = results.filter(r => r.riskLevel === 'high').length;
    const criticalRisk = results.filter(r => r.riskLevel === 'critical').length;
    const avgScore = results.reduce((sum, r) => sum + r.overallScore, 0) / total;

    return {
      total,
      verified,
      lowRisk,
      mediumRisk,
      highRisk,
      criticalRisk,
      avgScore: Math.round(avgScore)
    };
  }
}

// Export singleton instance
export const automatedComplianceService = new AutomatedComplianceService();




