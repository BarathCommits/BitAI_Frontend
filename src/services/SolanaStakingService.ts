/**
 * Solana Staking Service - Comprehensive staking operations
 * Integrates with Solana staking protocols and validators
 */

import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { StakeProgram } from '@solana/web3.js';

export interface ValidatorInfo {
  identity: string;
  voteAccount: string;
  name: string;
  website?: string;
  commission: number;
  activeStake: number;
  delinquent: boolean;
  apy: number;
  score: number;
  uptime: number;
}

export interface StakeAccount {
  address: string;
  balance: number;
  delegatedTo?: string;
  activationEpoch?: number;
  deactivationEpoch?: number;
  rewards: number;
  status: 'active' | 'inactive' | 'activating' | 'deactivating';
}

export interface StakingRewards {
  epoch: number;
  rewards: number;
  timestamp: Date;
  validator: string;
}

export interface StakingAnalytics {
  totalStaked: number;
  totalRewards: number;
  averageAPY: number;
  activeStakeAccounts: number;
  rewardsHistory: StakingRewards[];
  topValidators: ValidatorInfo[];
}

class SolanaStakingService {
  private connection: Connection;
  private walletPublicKey: PublicKey | null = null;

  constructor(rpcUrl: string = 'https://api.mainnet-beta.solana.com') {
    this.connection = new Connection(rpcUrl, 'confirmed');
  }

  setWallet(publicKey: PublicKey) {
    this.walletPublicKey = publicKey;
  }

  // Get all validators with performance metrics
  async getValidators(): Promise<ValidatorInfo[]> {
    try {
      const validators = await this.connection.getVoteAccounts();
      const validatorInfos: ValidatorInfo[] = [];

      // Get validator performance data
      const performanceData = await this.getValidatorPerformance();

      for (const validator of validators.current) {
        const performance = performanceData.find(p => p.identity === validator.nodePubkey);
        
        validatorInfos.push({
          identity: validator.nodePubkey,
          voteAccount: validator.votePubkey,
          name: validator.nodePubkey, // You might want to fetch actual names
          commission: validator.commission,
          activeStake: validator.activatedStake,
          delinquent: false,
          apy: performance?.apy || 0,
          score: performance?.score || 0,
          uptime: performance?.uptime || 0,
        });
      }

      // Sort by score (best validators first)
      return validatorInfos.sort((a, b) => b.score - a.score);
    } catch (error) {
      throw new Error(`Failed to fetch validators: ${error}`);
    }
  }

  // Get validator performance data
  private async getValidatorPerformance(): Promise<Array<{
    identity: string;
    apy: number;
    score: number;
    uptime: number;
  }>> {
    try {
      const response = await fetch('https://api.solana.fm/v0/validators');
      const data = await response.json();
      
      return data.map((validator: any) => ({
        identity: validator.identity,
        apy: validator.apy || 0,
        score: validator.score || 0,
        uptime: validator.uptime || 0,
      }));
    } catch (error) {
      console.warn('Failed to fetch validator performance data:', error);
      return [];
    }
  }

  // Get user's stake accounts
  async getStakeAccounts(): Promise<StakeAccount[]> {
    if (!this.walletPublicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      const stakeAccounts = await this.connection.getParsedProgramAccounts(
        StakeProgram.programId,
        {
          filters: [
            {
              dataSize: 200, // Stake account size
            },
            {
              memcmp: {
                offset: 12, // Stake account owner offset
                bytes: this.walletPublicKey.toBase58(),
              },
            },
          ],
        }
      );

      const accounts: StakeAccount[] = [];

      for (const account of stakeAccounts) {
        const accountInfo = account.account.data.parsed.info;
        const stakeAccount: StakeAccount = {
          address: account.pubkey.toString(),
          balance: accountInfo.stake?.delegation?.stake || 0,
          delegatedTo: accountInfo.stake?.delegation?.voter,
          activationEpoch: accountInfo.stake?.delegation?.activationEpoch,
          deactivationEpoch: accountInfo.stake?.delegation?.deactivationEpoch,
          rewards: 0, // You'll need to calculate this
          status: this.getStakeStatus(accountInfo.stake),
        };

        accounts.push(stakeAccount);
      }

      return accounts;
    } catch (error) {
      throw new Error(`Failed to fetch stake accounts: ${error}`);
    }
  }

  // Determine stake account status
  private getStakeStatus(stake: any): 'active' | 'inactive' | 'activating' | 'deactivating' {
    if (!stake) return 'inactive';
    
    const currentEpoch = 0; // You'll need to get current epoch
    const activationEpoch = stake.delegation?.activationEpoch;
    const deactivationEpoch = stake.delegation?.deactivationEpoch;

    if (deactivationEpoch && deactivationEpoch <= currentEpoch) {
      return 'inactive';
    } else if (activationEpoch && activationEpoch > currentEpoch) {
      return 'activating';
    } else if (deactivationEpoch && deactivationEpoch > currentEpoch) {
      return 'deactivating';
    } else {
      return 'active';
    }
  }

  // Create stake account
  async createStakeAccount(amount: number): Promise<Transaction> {
    if (!this.walletPublicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      const stakeAccount = new PublicKey(); // Generate new keypair
      const transaction = new Transaction();

      // Create stake account instruction
      const createStakeAccountInstruction = StakeProgram.createAccount({
        fromPubkey: this.walletPublicKey,
        stakePubkey: stakeAccount,
        authorized: {
          staker: this.walletPublicKey,
          withdrawer: this.walletPublicKey,
        },
        lamports: amount,
      });

      transaction.add(createStakeAccountInstruction);
      return transaction;
    } catch (error) {
      throw new Error(`Failed to create stake account: ${error}`);
    }
  }

  // Delegate stake to validator
  async delegateStake(stakeAccount: string, validatorVoteAccount: string): Promise<Transaction> {
    try {
      const stakePubkey = new PublicKey(stakeAccount);
      const votePubkey = new PublicKey(validatorVoteAccount);

      const transaction = new Transaction();
      const delegateInstruction = StakeProgram.delegate({
        stakePubkey,
        authorizedPubkey: this.walletPublicKey!,
        votePubkey,
      });

      transaction.add(delegateInstruction);
      return transaction;
    } catch (error) {
      throw new Error(`Failed to delegate stake: ${error}`);
    }
  }

  // Withdraw stake
  async withdrawStake(stakeAccount: string, amount: number): Promise<Transaction> {
    if (!this.walletPublicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      const stakePubkey = new PublicKey(stakeAccount);
      const transaction = new Transaction();

      const withdrawInstruction = StakeProgram.withdraw({
        stakePubkey,
        authorizedPubkey: this.walletPublicKey,
        toPubkey: this.walletPublicKey,
        lamports: amount,
      });

      transaction.add(withdrawInstruction);
      return transaction;
    } catch (error) {
      throw new Error(`Failed to withdraw stake: ${error}`);
    }
  }

  // Get staking rewards history
  async getStakingRewards(): Promise<StakingRewards[]> {
    if (!this.walletPublicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      const stakeAccounts = await this.getStakeAccounts();
      const rewards: StakingRewards[] = [];

      for (const account of stakeAccounts) {
        if (account.delegatedTo) {
          // Get rewards for this stake account
          const accountRewards = await this.getAccountRewards(account.address);
          rewards.push(...accountRewards);
        }
      }

      return rewards.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
      throw new Error(`Failed to fetch staking rewards: ${error}`);
    }
  }

  // Get rewards for specific stake account
  private async getAccountRewards(stakeAccount: string): Promise<StakingRewards[]> {
    try {
      const response = await fetch(`https://api.solana.fm/v0/accounts/${stakeAccount}/rewards`);
      const data = await response.json();

      return data.map((reward: any) => ({
        epoch: reward.epoch,
        rewards: reward.amount,
        timestamp: new Date(reward.timestamp),
        validator: reward.validator,
      }));
    } catch (error) {
      console.warn(`Failed to fetch rewards for account ${stakeAccount}:`, error);
      return [];
    }
  }

  // Get comprehensive staking analytics
  async getStakingAnalytics(): Promise<StakingAnalytics> {
    const stakeAccounts = await this.getStakeAccounts();
    const rewards = await this.getStakingRewards();
    const validators = await this.getValidators();

    const totalStaked = stakeAccounts.reduce((sum, account) => sum + account.balance, 0);
    const totalRewards = rewards.reduce((sum, reward) => sum + reward.rewards, 0);
    const activeStakeAccounts = stakeAccounts.filter(account => account.status === 'active').length;

    // Calculate average APY
    const averageAPY = validators.length > 0 
      ? validators.reduce((sum, validator) => sum + validator.apy, 0) / validators.length
      : 0;

    // Get top validators by score
    const topValidators = validators.slice(0, 10);

    return {
      totalStaked,
      totalRewards,
      averageAPY,
      activeStakeAccounts,
      rewardsHistory: rewards,
      topValidators,
    };
  }

  // Get AI-powered validator recommendations
  async getValidatorRecommendations(): Promise<ValidatorInfo[]> {
    const validators = await this.getValidators();
    
    // AI-powered scoring algorithm
    return validators
      .filter(validator => !validator.delinquent)
      .sort((a, b) => {
        // Score based on multiple factors
        const scoreA = (a.apy * 0.4) + (a.uptime * 0.3) + ((100 - a.commission) * 0.2) + (a.score * 0.1);
        const scoreB = (b.apy * 0.4) + (b.uptime * 0.3) + ((100 - b.commission) * 0.2) + (b.score * 0.1);
        return scoreB - scoreA;
      })
      .slice(0, 5); // Top 5 recommendations
  }
}

export default SolanaStakingService;

