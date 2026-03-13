import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const { default: User } = await import('./models/User.js');

// Generate BitSolidus internal wallet address
const generateInternalWallet = () => {
  const prefix = 'BITS';
  const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `${prefix}${randomPart}`;
};

const addInternalWallets = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all users without internalWallet
    const usersWithoutWallet = await User.find({ 
      $or: [
        { internalWallet: null },
        { internalWallet: { $exists: false } }
      ]
    });

    console.log(`Found ${usersWithoutWallet.length} users without internal wallet`);

    // Add internal wallet to each user
    let updatedCount = 0;
    for (const user of usersWithoutWallet) {
      const walletAddress = generateInternalWallet();
      
      // Ensure uniqueness
      let isUnique = false;
      let attempts = 0;
      while (!isUnique && attempts < 10) {
        const existingUser = await User.findOne({ internalWallet: walletAddress });
        if (!existingUser) {
          isUnique = true;
        } else {
          walletAddress = generateInternalWallet();
          attempts++;
        }
      }

      user.internalWallet = walletAddress;
      await user.save();
      updatedCount++;
      
      if (updatedCount % 10 === 0 || updatedCount === usersWithoutWallet.length) {
        console.log(`Updated ${updatedCount}/${usersWithoutWallet.length} users`);
      }
    }

    console.log(`\n✅ Successfully added internal wallets to ${updatedCount} users`);
    
    // Verify all users now have wallets
    const remainingUsers = await User.countDocuments({ 
      $or: [
        { internalWallet: null },
        { internalWallet: { $exists: false } }
      ]
    });
    
    if (remainingUsers === 0) {
      console.log('✅ All users now have internal wallet addresses!');
    } else {
      console.log(`⚠️  ${remainingUsers} users still missing internal wallets`);
    }

    mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

// Run the migration
addInternalWallets();
