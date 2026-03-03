import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Transaction from './models/Transaction.js';

dotenv.config();

const checkDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Check users
    const totalUsers = await User.countDocuments({ isAdmin: false });
    const activeUsers = await User.countDocuments({ isAdmin: false, isActive: true });
    const pendingKYC = await User.countDocuments({ isAdmin: false, kycStatus: 'pending' });
    
    console.log('=== USER STATISTICS ===');
    console.log('Total Users:', totalUsers);
    console.log('Active Users:', activeUsers);
    console.log('Pending KYC:', pendingKYC);
    
    const users = await User.find({ isAdmin: false }).select('username email isActive kycStatus kycData balance tier createdAt');
    console.log('\n=== ALL USERS ===');
    users.forEach(u => {
      console.log(`- ${u.username} (${u.email})`);
      console.log(`  Active: ${u.isActive}, KYC: ${u.kycStatus}, Tier: ${u.tier}, Balance: $${u.balance.toFixed(2)}`);
      if (u.kycData && u.kycData.firstName) {
        console.log(`  KYC Data: ${u.kycData.firstName} ${u.kycData.lastName}, ${u.kycData.country}`);
        console.log(`  Documents: Front:${u.kycData.idFrontImage ? 'Yes' : 'No'}, Back:${u.kycData.idBackImage ? 'Yes' : 'No'}, Selfie:${u.kycData.selfieImage ? 'Yes' : 'No'}`);
      }
    });

    // Check transactions
    const totalTransactions = await Transaction.countDocuments();
    const pendingWithdrawals = await Transaction.countDocuments({ type: 'withdrawal', status: 'pending' });
    
    console.log('\n=== TRANSACTION STATISTICS ===');
    console.log('Total Transactions:', totalTransactions);
    console.log('Pending Withdrawals:', pendingWithdrawals);
    
    const transactions = await Transaction.find().populate('userId', 'username').limit(5);
    console.log('\n=== RECENT TRANSACTIONS ===');
    transactions.forEach(t => {
      console.log(`- ${t.type.toUpperCase()}: $${t.amount.toFixed(2)} by ${t.userId?.username || 'Unknown'} (${t.status})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

checkDatabase();
