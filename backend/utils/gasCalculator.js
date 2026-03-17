import { ethers } from 'ethers';
import AdminSettings from '../models/AdminSettings.js';

// Calculate gas fee for a withdrawal
export const calculateGasFee = async (amount, currency, networkName) => {
  try {
    console.log('Calculating gas fee:', { amount, currency, networkName });
    const settings = await AdminSettings.getCurrentSettings();
    
    // Use withdrawalGasFee settings (percentage-based) as primary calculation
    // This doesn't require network configuration
    if (settings.withdrawalGasFee?.enabled && amount > 0) {
      const gasFeeSettings = settings.withdrawalGasFee;
      
      // Calculate gas fee as percentage of withdrawal amount (in USD)
      const percentageFee = amount * (gasFeeSettings.percentage / 100);
      const calculatedFee = Math.min(
        Math.max(percentageFee, gasFeeSettings.minFee),
        gasFeeSettings.maxFee
      );
      
      console.log('Using withdrawalGasFee settings:', { 
        amount, 
        percentage: gasFeeSettings.percentage,
        calculatedFee 
      });
      
      return {
        gasFee: calculatedFee,
        gasPrice: '20',
        gasLimit: 21000,
        network: networkName,
        currency: currency,
        subsidy: 0,
        userPays: calculatedFee,
        platformPays: 0,
        gasSubsidyPercentage: 0,
        calculatedFromSettings: true
      };
    }
    
    // Fallback: Check if networks are configured for blockchain-based calculation
    if (!settings.networks || !Array.isArray(settings.networks) || settings.networks.length === 0) {
      console.log('No networks configured, using default gas fee');
      // Return default gas fee based on amount
      const defaultFee = Math.min(Math.max(amount * 0.025, 5), 500); // 2.5% with min $5, max $500
      return {
        gasFee: defaultFee,
        gasPrice: '20',
        gasLimit: 21000,
        network: networkName,
        currency: currency,
        subsidy: 0,
        userPays: defaultFee,
        platformPays: 0,
        gasSubsidyPercentage: 0,
        defaultCalculation: true
      };
    }
    
    // Find network configuration for blockchain-based calculation
    const network = settings.networks.find(n => n.name === networkName && n.enabled);
    if (!network) {
      console.error(`Network ${networkName} not found. Available networks:`, settings.networks.map(n => n.name));
      // Use settings-based calculation as fallback
      const fallbackFee = Math.min(Math.max(amount * 0.025, 5), 500);
      return {
        gasFee: fallbackFee,
        gasPrice: '20',
        gasLimit: 21000,
        network: networkName,
        currency: currency,
        subsidy: 0,
        userPays: fallbackFee,
        platformPays: 0,
        gasSubsidyPercentage: 0,
        fallback: true
      };
    }

    // Get gas price
    let gasPrice;
    if (settings.gasPriceSource === 'fixed') {
      const fixedPrice = settings.fixedGasPrice || 20;
      gasPrice = ethers.parseUnits(fixedPrice.toString(), 'gwei');
    } else {
      // Use network gas price
      const networkPrice = network.gasPrice || 20;
      gasPrice = ethers.parseUnits(networkPrice.toString(), 'gwei');
    }

    // Apply multiplier (default to 1.0 if not set)
    const multiplier = settings.gasMultiplier || 1.0;
    const adjustedGasPrice = (gasPrice * BigInt(Math.round(multiplier * 100))) / BigInt(100);

    // Calculate gas limit (21000 for standard transfer)
    const gasLimit = BigInt(settings.gasLimit || 21000);

    // Calculate total gas fee
    const gasFee = adjustedGasPrice * gasLimit;

    // Convert to ETH/BNB/MATIC
    const gasFeeInEth = ethers.formatEther(gasFee);
    
    // Calculate subsidy (default to 0 if not set)
    const subsidyPercentage = settings.gasSubsidy || 0;
    const subsidyAmount = (parseFloat(gasFeeInEth) * subsidyPercentage) / 100;
    const userPays = parseFloat(gasFeeInEth) - subsidyAmount;

    return {
      gasFee: parseFloat(gasFeeInEth),
      gasPrice: ethers.formatUnits(adjustedGasPrice, 'gwei'),
      gasLimit: settings.gasLimit || 21000,
      network: networkName,
      currency: network.symbol,
      subsidy: subsidyAmount,
      userPays: userPays,
      platformPays: subsidyAmount,
      gasSubsidyPercentage: subsidyPercentage
    };
  } catch (error) {
    console.error('Gas calculation error:', error);
    throw error;
  }
};

// Check if user has sufficient gas
export const checkSufficientGas = async (userBalance, amount, currency, networkName) => {
  try {
    const gasInfo = await calculateGasFee(amount, currency, networkName);
    
    // For simplicity, assume user balance is in the same currency as gas
    // In real implementation, you'd need to check native token balance
    const hasSufficientGas = userBalance >= gasInfo.userPays;

    return {
      sufficient: hasSufficientGas,
      required: gasInfo.userPays,
      current: userBalance,
      deficit: hasSufficientGas ? 0 : gasInfo.userPays - userBalance,
      gasInfo
    };
  } catch (error) {
    console.error('Gas check error:', error);
    throw error;
  }
};

// Calculate withdrawal amount with percentage logic
export const calculateWithdrawalAmount = async (requestedAmount, user, settings) => {
  try {
    // Get user's effective withdrawal percentage
    let percentage;
    if (user.withdrawalPercentage !== null) {
      percentage = user.withdrawalPercentage;
    } else if (settings.globalWithdrawalPercentage) {
      percentage = settings.withdrawalPercentage;
    } else {
      percentage = 100;
    }

    // Check for user override in settings
    const userOverride = settings.userOverrides.find(
      override => override.userId.toString() === user._id.toString()
    );
    
    if (userOverride) {
      percentage = userOverride.withdrawalPercentage;
    }

    // Calculate maximum allowed withdrawal
    const maxWithdrawal = user.balance * (percentage / 100);
    
    // Determine final amount
    const finalAmount = Math.min(requestedAmount, maxWithdrawal);
    const blockedAmount = requestedAmount - finalAmount;

    return {
      requested: requestedAmount,
      allowed: finalAmount,
      blocked: blockedAmount,
      percentage: percentage,
      maxAllowed: maxWithdrawal,
      canWithdraw: finalAmount > 0
    };
  } catch (error) {
    console.error('Withdrawal calculation error:', error);
    throw error;
  }
};

// Get current gas prices from network
export const getNetworkGasPrices = async () => {
  try {
    const settings = await AdminSettings.getCurrentSettings();
    const gasPrices = {};

    for (const network of settings.networks.filter(n => n.enabled)) {
      try {
        const provider = new ethers.JsonRpcProvider(network.rpcUrl);
        const feeData = await provider.getFeeData();
        
        gasPrices[network.name] = {
          gasPrice: feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, 'gwei') : network.gasPrice.toString(),
          maxFeePerGas: feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, 'gwei') : null,
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei') : null,
          chainId: network.chainId,
          symbol: network.symbol
        };
      } catch (error) {
        console.warn(`Failed to get gas price for ${network.name}:`, error.message);
        gasPrices[network.name] = {
          gasPrice: network.gasPrice.toString(),
          chainId: network.chainId,
          symbol: network.symbol,
          fallback: true
        };
      }
    }

    return gasPrices;
  } catch (error) {
    console.error('Get gas prices error:', error);
    throw error;
  }
};
