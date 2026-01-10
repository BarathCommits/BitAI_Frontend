/**
 * Hook for automated compliance verification
 * 
 * Features:
 * - Verify smart contracts for compliance
 * - Batch verification support
 * - Risk level assessment
 * - Verification summary statistics
 * 
 * Used in ComplianceVerification component.
 */
import { useState, useCallback } from 'react';
import { automatedComplianceService, ComplianceVerificationResult } from '../services/AutomatedComplianceService';
import { logger } from '../utils/logger';

export interface UseComplianceVerificationReturn {
  // State
  isLoading: boolean;
  error: string | null;
  results: ComplianceVerificationResult[];
  
  // Actions
  verifyContract: (contractAddress: string, chainId?: number) => Promise<ComplianceVerificationResult>;
  batchVerifyContracts: (contracts: Array<{ address: string; chainId?: number }>) => Promise<ComplianceVerificationResult[]>;
  clearResults: () => void;
  clearError: () => void;
  
  // Computed
  verificationSummary: {
    total: number;
    verified: number;
    lowRisk: number;
    mediumRisk: number;
    highRisk: number;
    criticalRisk: number;
    avgScore: number;
  };
}

export const useComplianceVerification = (): UseComplianceVerificationReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ComplianceVerificationResult[]>([]);

  const verifyContract = useCallback(async (
    contractAddress: string, 
    chainId: number = 1
  ): Promise<ComplianceVerificationResult> => {
    setIsLoading(true);
    setError(null);

    try {
      logger.debug(`🔍 Verifying contract: ${contractAddress}`);
      const result = await automatedComplianceService.verifyContract(contractAddress, chainId);
      
      // Add to results if not already present
      setResults(prev => {
        const existingIndex = prev.findIndex(r => r.contractAddress === contractAddress);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = result;
          return updated;
        }
        return [...prev, result];
      });

      logger.debug(`✅ Contract verification completed:`, result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Verification failed';
      setError(errorMessage);
      logger.error(`❌ Contract verification failed:`, err);
      
      // Return error result
      const errorResult: ComplianceVerificationResult = {
        contractAddress,
        overallScore: 0,
        riskLevel: 'critical',
        verified: false,
        checks: {
          contractVerification: { contractAddress, verified: false },
          auditDatabases: [],
          securityScores: []
        },
        recommendations: ['Verification failed - manual review required'],
        requiresManualReview: true,
        lastChecked: new Date().toISOString()
      };
      
      return errorResult;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const batchVerifyContracts = useCallback(async (
    contracts: Array<{ address: string; chainId?: number }>
  ): Promise<ComplianceVerificationResult[]> => {
    setIsLoading(true);
    setError(null);

    try {
      logger.debug(`🔄 Starting batch verification for ${contracts.length} contracts`);
      const batchResults = await automatedComplianceService.batchVerifyContracts(contracts);
      
      // Update results
      setResults(prev => {
        const updated = [...prev];
        batchResults.forEach(result => {
          const existingIndex = updated.findIndex(r => r.contractAddress === result.contractAddress);
          if (existingIndex >= 0) {
            updated[existingIndex] = result;
          } else {
            updated.push(result);
          }
        });
        return updated;
      });

      logger.debug(`✅ Batch verification completed:`, batchResults);
      return batchResults;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Batch verification failed';
      setError(errorMessage);
      logger.error(`❌ Batch verification failed:`, err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Compute verification summary
  const verificationSummary = automatedComplianceService.getVerificationSummary(results);

  return {
    // State
    isLoading,
    error,
    results,
    
    // Actions
    verifyContract,
    batchVerifyContracts,
    clearResults,
    clearError,
    
    // Computed
    verificationSummary
  };
};




