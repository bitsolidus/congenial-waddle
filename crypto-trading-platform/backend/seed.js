import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import AdminSettings from './models/AdminSettings.js';
import Transaction from './models/Transaction.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin user exists
    const adminExists = await User.findOne({ email: 'admin@cryptoplatform.com' });
    
    if (!adminExists) {
      // Create admin user
      await User.create({
        username: 'admin',
        email: 'admin@cryptoplatform.com',
        password: 'admin123',
        isAdmin: true,
        emailVerified: true,
        balance: 100000,
        tier: 'vip'
      });
      console.log('Admin user created: admin@cryptoplatform.com / admin123');
    } else {
      console.log('Admin user already exists');
    }

    // Check if settings exist
    const settingsExist = await AdminSettings.findOne({});
    
    if (!settingsExist) {
      // Create default settings
      await AdminSettings.create({
        withdrawalPercentage: 75,
        gasSubsidy: 50, // 50% subsidy (0 = user pays full, 100 = platform pays full)
        requireAdminApproval: true,
        gasMultiplier: 1.5,
        gasLimit: 21000
      });
      console.log('Default settings created');
    } else {
      console.log('Settings already exist');
    }

    // Create test users if they don't exist
    const testUsers = [
      { username: 'testuser1', email: 'test1@example.com', password: 'TestPass123!' },
      { username: 'testuser2', email: 'test2@example.com', password: 'TestPass123!' },
      { username: 'trader_john', email: 'john@example.com', password: 'TestPass123!' },
      { username: 'crypto_mike', email: 'mike@example.com', password: 'TestPass123!' },
      { username: 'investor_sarah', email: 'sarah@example.com', password: 'TestPass123!' }
    ];

    for (const userData of testUsers) {
      const userExists = await User.findOne({ email: userData.email });
      if (!userExists) {
        await User.create({
          ...userData,
          balance: Math.random() * 10000,
          tier: ['bronze', 'silver', 'gold', 'platinum'][Math.floor(Math.random() * 4)],
          kycStatus: ['pending', 'verified', 'rejected'][Math.floor(Math.random() * 3)],
          isActive: true
        });
        console.log(`Test user created: ${userData.email}`);
      } else {
        console.log(`Test user already exists: ${userData.email}`);
      }
    }

    // Create sample transactions
    const transactionCount = await Transaction.countDocuments();
    if (transactionCount === 0) {
      const users = await User.find({ isAdmin: false });
      const transactionTypes = ['deposit', 'withdrawal'];
      const statuses = ['completed', 'pending', 'approved', 'rejected'];
      const networks = ['bitcoin', 'ethereum', 'usdt'];
      
      for (let i = 0; i < 20; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const amount = Math.random() * 5000 + 100;
        
        await Transaction.create({
          userId: user._id,
          type,
          amount,
          status,
          network: networks[Math.floor(Math.random() * networks.length)],
          walletAddress: user.walletAddress || `0x${Math.random().toString(16).substr(2, 40)}`,
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        });
      }
      console.log('Sample transactions created');
    } else {
      console.log('Transactions already exist');
    }

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();
