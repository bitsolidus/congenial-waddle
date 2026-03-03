import { ethers } from 'ethers';
import AdminSettings from '../models/AdminSettings.js';

// Calculate gas fee for a withdrawal
export const calculateGasFee = async (amount, currency, networkName) => {
  try {
    const settings = await AdminSettings.getCurrentSettings();
    
    // Find network configuration
    const network = settings.networks.find(n => n.name === networkName && n.enabled);
    if (!network) {
      throw new Error(`Network ${networkName} not found or disabled`);
    }

    // Get gas price
    let gasPrice;
    if (settings.gasPriceSource === 'fixed') {
      gasPrice = ethers.parseUnits(settings.fixedGasPrice.toString(), 'gwei');
    } else {
      // Use network gas price
      gasPrice = ethers.parseUnits(network.gasPrice.toString(), 'gwei');
    }

    // Apply multiplier
    const adjustedGasPrice = (gasPrice * BigInt(Math.round(settings.gasMultiplier * 100))) / BigInt(100);

    // Calculate gas limit (21000 for standard transfer)
    const gasLimit = BigInt(settings.gasLimit || 21000);

    // Calculate total gas fee
    const gasFee = adjustedGasPrice * gasLimit;

    // Convert to ETH/BNB/MATIC
    const gasFeeInEth = ethers.formatEther(gasFee);
    
    // Calculate subsidy
    const subsidyAmount = (parseFloat(gasFeeInEth) * settings.gasSubsidy) / 100;
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
      gasSubsidyPercentage: settings.gasSubsidy
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
