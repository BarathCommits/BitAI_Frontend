/**
 * Compliance Verification Service
 * 
 * Handles verification of uploaded dApps for security audits and compliance
 */

export interface ComplianceAudit {
  id: string;
  auditorName: string;
  auditorWebsite: string;
  auditDate: string;
  auditType: 'smart-contract' | 'security' | 'compliance' | 'penetration-test';
  auditStatus: 'passed' | 'failed' | 'pending' | 'expired';
  auditScore?: number; // 0-100
  auditReportUrl?: string;
  findings?: ComplianceFinding[];
  certificateUrl?: string;
  expiresAt?: string;
}

export interface ComplianceFinding {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  status: 'resolved' | 'unresolved' | 'mitigated';
  resolution?: string;
}

export interface ComplianceVerification {
  appId: string;
  verificationStatus: 'verified' | 'pending' | 'rejected' | 'expired';
  verificationDate: string;
  verifiedBy: string;
  audits: ComplianceAudit[];
  complianceScore: number; // Overall score 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  lastVerified: string;
  nextVerificationDue: string;
}

export interface ComplianceRequirement {
  id: string;
  name: string;
  description: string;
  required: boolean;
  category: 'security' | 'legal' | 'financial' | 'operational';
  verificationMethod: 'document' | 'api' | 'manual' | 'automated';
}

class ComplianceVerificationService {
  private readonly COMPLIANCE_REQUIREMENTS: ComplianceRequirement[] = [
    {
      id: 'smart-contract-audit',
      name: 'Smart Contract Security Audit',
      description: 'Professional audit of smart contracts by certified auditors',
      required: true,
      category: 'security',
      verificationMethod: 'document'
    },
    {
      id: 'penetration-test',
      name: 'Penetration Testing',
      description: 'Security testing of the application infrastructure',
      required: true,
      category: 'security',
      verificationMethod: 'document'
    },
    {
      id: 'kyc-compliance',
      name: 'KYC/AML Compliance',
      description: 'Know Your Customer and Anti-Money Laundering compliance',
      required: true,
      category: 'legal',
      verificationMethod: 'document'
    },
    {
      id: 'data-protection',
      name: 'Data Protection Compliance',
      description: 'GDPR, CCPA, or other data protection regulation compliance',
      required: true,
      category: 'legal',
      verificationMethod: 'document'
    },
    {
      id: 'financial-audit',
      name: 'Financial Audit',
      description: 'Audit of financial operations and tokenomics',
      required: false,
      category: 'financial',
      verificationMethod: 'document'
    }
  ];

  private readonly TRUSTED_AUDITORS = [
    {
      name: 'CertiK',
      website: 'https://www.certik.com',
      apiEndpoint: 'https://api.certik.com/v1/audit/verify',
      verificationMethod: 'api'
    },
    {
      name: 'ConsenSys Diligence',
      website: 'https://consensys.net/diligence/',
      apiEndpoint: 'https://diligence.consensys.net/api/audit/verify',
      verificationMethod: 'api'
    },
    {
      name: 'OpenZeppelin',
      website: 'https://openzeppelin.com/security-audits/',
      apiEndpoint: 'https://security.openzeppelin.com/api/audit/verify',
      verificationMethod: 'api'
    },
    {
      name: 'Trail of Bits',
      website: 'https://www.trailofbits.com',
      apiEndpoint: 'https://api.trailofbits.com/v1/audit/verify',
      verificationMethod: 'api'
    },
    {
      name: 'Quantstamp',
      website: 'https://quantstamp.com',
      apiEndpoint: 'https://api.quantstamp.com/v1/audit/verify',
      verificationMethod: 'api'
    },
    {
      name: 'Hacken',
      website: 'https://hacken.io',
      apiEndpoint: 'https://api.hacken.io/v1/audit/verify',
      verificationMethod: 'api'
    },
    {
      name: 'SlowMist',
      website: 'https://slowmist.com',
      apiEndpoint: 'https://api.slowmist.com/v1/audit/verify',
      verificationMethod: 'api'
    }
  ];

  /**
   * Get all compliance requirements
   */
  public getComplianceRequirements(): ComplianceRequirement[] {
    return this.COMPLIANCE_REQUIREMENTS;
  }

  /**
   * Get trusted auditors list
   */
  public getTrustedAuditors() {
    return this.TRUSTED_AUDITORS;
  }

  /**
   * Verify audit report authenticity
   */
  public async verifyAuditReport(auditData: {
    auditorName: string;
    contractAddress?: string;
    auditReportUrl: string;
    certificateUrl?: string;
    auditDate: string;
  }): Promise<{ success: boolean; verification: ComplianceVerification | null; error?: string }> {
    try {
      // Find the auditor in trusted list
      const auditor = this.TRUSTED_AUDITORS.find(a => 
        a.name.toLowerCase().includes(auditData.auditorName.toLowerCase()) ||
        auditData.auditorName.toLowerCase().includes(a.name.toLowerCase())
      );

      if (!auditor) {
        return {
          success: false,
          verification: null,
          error: 'Auditor not in trusted list. Please use a verified auditor.'
        };
      }

      // If auditor has API endpoint, try automated verification
      if (auditor.verificationMethod === 'api') {
        const apiVerification = await this.verifyViaAPI(auditor, auditData);
        if (apiVerification.success) {
          return apiVerification;
        }
      }

      // Fallback to manual verification
      return await this.verifyManually(auditData);
    } catch (error) {
      return {
        success: false,
        verification: null,
        error: error instanceof Error ? error.message : 'Verification failed'
      };
    }
  }

  /**
   * Verify audit via auditor API
   */
  private async verifyViaAPI(auditor: any, auditData: any): Promise<{ success: boolean; verification: ComplianceVerification | null; error?: string }> {
    try {
      const response = await fetch(auditor.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_AUDITOR_API_KEY || ''}`
        },
        body: JSON.stringify({
          contractAddress: auditData.contractAddress,
          auditReportUrl: auditData.auditReportUrl,
          certificateUrl: auditData.certificateUrl,
          auditDate: auditData.auditDate
        })
      });

      if (!response.ok) {
        throw new Error(`API verification failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.verified) {
        return {
          success: true,
          verification: {
            appId: auditData.contractAddress || 'unknown',
            verificationStatus: 'verified',
            verificationDate: new Date().toISOString(),
            verifiedBy: auditor.name,
            audits: [{
              id: result.auditId,
              auditorName: auditor.name,
              auditorWebsite: auditor.website,
              auditDate: auditData.auditDate,
              auditType: 'smart-contract',
              auditStatus: 'passed',
              auditScore: result.score,
              auditReportUrl: auditData.auditReportUrl,
              certificateUrl: auditData.certificateUrl
            }],
            complianceScore: result.score,
            riskLevel: this.calculateRiskLevel(result.score),
            lastVerified: new Date().toISOString(),
            nextVerificationDue: this.calculateNextVerificationDate()
          }
        };
      }

      return {
        success: false,
        verification: null,
        error: 'API verification failed'
      };
    } catch (error) {
      console.warn('API verification failed, falling back to manual verification:', error);
      return {
        success: false,
        verification: null,
        error: 'API verification unavailable'
      };
    }
  }

  /**
   * Manual verification process
   */
  private async verifyManually(auditData: any): Promise<{ success: boolean; verification: ComplianceVerification | null; error?: string }> {
    // This would typically involve:
    // 1. Document validation
    // 2. Manual review by compliance team
    // 3. Cross-reference with auditor databases
    
    return {
      success: true,
      verification: {
        appId: auditData.contractAddress || 'unknown',
        verificationStatus: 'pending',
        verificationDate: new Date().toISOString(),
        verifiedBy: 'Manual Review',
        audits: [{
          id: `manual-${Date.now()}`,
          auditorName: auditData.auditorName,
          auditorWebsite: '',
          auditDate: auditData.auditDate,
          auditType: 'smart-contract',
          auditStatus: 'pending',
          auditReportUrl: auditData.auditReportUrl,
          certificateUrl: auditData.certificateUrl
        }],
        complianceScore: 0,
        riskLevel: 'high',
        lastVerified: new Date().toISOString(),
        nextVerificationDue: this.calculateNextVerificationDate()
      }
    };
  }

  /**
   * Calculate risk level based on compliance score
   */
  private calculateRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 90) return 'low';
    if (score >= 70) return 'medium';
    if (score >= 50) return 'high';
    return 'critical';
  }

  /**
   * Calculate next verification due date (typically 1 year)
   */
  private calculateNextVerificationDate(): string {
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    return nextYear.toISOString();
  }

  /**
   * Check if audit is expired
   */
  public isAuditExpired(auditDate: string, validityMonths: number = 12): boolean {
    const audit = new Date(auditDate);
    const expiry = new Date(audit);
    expiry.setMonth(expiry.getMonth() + validityMonths);
    return new Date() > expiry;
  }

  /**
   * Generate compliance report
   */
  public generateComplianceReport(verification: ComplianceVerification): {
    summary: string;
    recommendations: string[];
    riskAssessment: string;
  } {
    const recommendations: string[] = [];
    let riskAssessment = '';

    // Analyze audit scores
    const avgScore = verification.audits.reduce((sum, audit) => sum + (audit.auditScore || 0), 0) / verification.audits.length;
    
    if (avgScore < 70) {
      recommendations.push('Consider additional security audits');
      recommendations.push('Implement security best practices');
    }

    if (verification.riskLevel === 'high' || verification.riskLevel === 'critical') {
      recommendations.push('Address critical security findings immediately');
      recommendations.push('Consider professional security consultation');
    }

    // Check for expired audits
    const expiredAudits = verification.audits.filter(audit => 
      this.isAuditExpired(audit.auditDate)
    );
    
    if (expiredAudits.length > 0) {
      recommendations.push('Schedule fresh security audits');
    }

    // Risk assessment
    switch (verification.riskLevel) {
      case 'low':
        riskAssessment = 'Low risk - Application appears secure and compliant';
        break;
      case 'medium':
        riskAssessment = 'Medium risk - Some security concerns identified';
        break;
      case 'high':
        riskAssessment = 'High risk - Significant security concerns require attention';
        break;
      case 'critical':
        riskAssessment = 'Critical risk - Immediate security intervention required';
        break;
    }

    return {
      summary: `Compliance verification ${verification.verificationStatus} with overall score of ${verification.complianceScore}/100`,
      recommendations,
      riskAssessment
    };
  }

  /**
   * Validate uploaded compliance documents
   */
  public validateComplianceDocument(file: File): Promise<{ valid: boolean; errors: string[] }> {
    return new Promise((resolve) => {
      const errors: string[] = [];
      
      // Check file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        errors.push('Invalid file type. Please upload PDF, JPEG, PNG, or TXT files.');
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        errors.push('File size too large. Maximum size is 10MB.');
      }

      // Check file name for audit indicators
      const fileName = file.name.toLowerCase();
      const auditKeywords = ['audit', 'security', 'compliance', 'certificate', 'report'];
      const hasAuditKeyword = auditKeywords.some(keyword => fileName.includes(keyword));
      
      if (!hasAuditKeyword) {
        errors.push('File name should contain audit-related keywords (audit, security, compliance, certificate, report).');
      }

      resolve({
        valid: errors.length === 0,
        errors
      });
    });
  }
}

// Export singleton instance
export const complianceVerificationService = new ComplianceVerificationService();




