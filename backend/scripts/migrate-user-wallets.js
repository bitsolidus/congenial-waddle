/**
 * Migration Script: Add Internal Wallets to All Users
 * 
 * This script generates unique BITS wallet addresses for all users
 * who don't have one yet.
 * 
 * Usage: node scripts/migrate-user-wallets.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const { default: User } = await import('../models/User.js');

// Generate BitSolidus internal wallet address
const generateInternalWallet = () => {
  const prefix = 'BITS';
  const randomPart = Math.random().toString(36).substring(2, 9).toUpperCase();
  return `${prefix}${randomPart}`;
};

const migrateUserWallets = async () => {
  try {
    console.log('🚀 Starting wallet migration...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all users without internalWallet
    const usersWithoutWallet = await User.find({ 
      $or: [
        { internalWallet: null },
        { internalWallet: { $exists: false } },
        { internalWallet: '' }
      ]
    });

    console.log(`📊 Found ${usersWithoutWallet.length} users without internal wallet\n`);

    if (usersWithoutWallet.length === 0) {
      console.log('✅ All users already have internal wallets!');
      mongoose.connection.close();
      return;
    }

    // Add internal wallet to each user
    let updatedCount = 0;
    let errorCount = 0;
    
    console.log('⏳ Generating wallets...\n');
    
    for (const user of usersWithoutWallet) {
      try {
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
            console.log(`  ⚠️  Duplicate found for ${user.username}, regenerating... (attempt ${attempts})`);
          }
        }

        if (!isUnique) {
          throw new Error('Failed to generate unique wallet after 10 attempts');
        }

        user.internalWallet = walletAddress;
        await user.save();
        
        updatedCount++;
        
        // Progress logging
        if (updatedCount % 10 === 0 || updatedCount === usersWithoutWallet.length) {
          console.log(`   ✓ Updated ${updatedCount}/${usersWithoutWallet.length} users`);
        }
      } catch (userError) {
        errorCount++;
        console.error(`  ❌ Error processing user ${user.username}:`, userError.message);
      }
    }

    console.log('\n===========================================');
    console.log('📊 MIGRATION SUMMARY');
    console.log('===========================================');
    console.log(`✅ Successfully added wallets: ${updatedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📈 Total processed: ${usersWithoutWallet.length}`);
    
    // Verify all users now have wallets
    const remainingUsers = await User.countDocuments({ 
      $or: [
        { internalWallet: null },
        { internalWallet: { $exists: false } },
        { internalWallet: '' }
      ]
    });
    
    if (remainingUsers === 0) {
      console.log('\n✅ SUCCESS! All users now have internal wallet addresses!');
    } else {
      console.log(`\n⚠️  WARNING: ${remainingUsers} users still missing internal wallets`);
    }
    
    console.log('\n🎉 Migration completed!\n');

    mongoose.connection.close();
    console.log('📛 Database connection closed\n');
  } catch (error) {
    console.error('\n❌ CRITICAL ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

// Run the migration
console.log('===========================================');
console.log('BitSolidus Wallet Migration Script');
console.log('===========================================\n');

migrateUserWallets();
