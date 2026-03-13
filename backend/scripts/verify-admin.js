/**
 * Script to Verify/Set Admin Privileges
 * 
 * Usage: 
 *   node scripts/verify-admin.js <email>
 *   node scripts/verify-admin.js <email> true  # to set as admin
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const { default: User } = await import('../models/User.js');

const verifyAdmin = async (email, setAsAdmin = false) => {
  try {
    console.log('===========================================');
    console.log('Admin Privilege Verification Tool');
    console.log('===========================================\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`❌ User not found with email: ${email}`);
      mongoose.connection.close();
      return;
    }

    console.log('📊 User Details:');
    console.log('-------------------------------------------');
    console.log(`Name:        ${user.username}`);
    console.log(`Email:       ${user.email}`);
    console.log(`ID:          ${user._id}`);
    console.log(`Is Admin:    ${user.isAdmin ? '✅ YES' : '❌ NO'}`);
    console.log(`Created:     ${new Date(user.createdAt).toLocaleString()}`);
    console.log('-------------------------------------------\n');

    if (setAsAdmin) {
      // Set user as admin
      user.isAdmin = true;
      await user.save();
      
      console.log('✅ SUCCESS! User has been granted admin privileges.\n');
      console.log('📝 You can now access admin routes at /admin/*\n');
    } else if (!user.isAdmin) {
      console.log('⚠️  This user does NOT have admin privileges.\n');
      console.log('To grant admin access, run:\n');
      console.log(`   node scripts/verify-admin.js ${email} true\n`);
    } else {
      console.log('✅ User already has admin privileges!\n');
    }

    mongoose.connection.close();
    console.log('📛 Database connection closed\n');
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

// Get command line arguments
const args = process.argv.slice(2);
const email = args[0];
const setAsAdmin = args[1] === 'true';

if (!email) {
  console.log('\n❌ Please provide an email address.\n');
  console.log('Usage:');
  console.log('  node scripts/verify-admin.js <email>');
  console.log('  node scripts/verify-admin.js <email> true  # to set as admin\n');
  process.exit(1);
}

verifyAdmin(email, setAsAdmin);
