#!/usr/bin/env node

/**
 * Quick Database Connection Test
 * Run this on Hostinger to verify MongoDB connection
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Testing MongoDB Connection...\n');

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('❌ MONGODB_URI is NOT set in environment variables!');
  console.error('\n📝 Please add to your backend/.env file:');
  console.error('MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname\n');
  process.exit(1);
}

console.log('✅ MONGODB_URI found:', mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@'));
console.log('\n🔗 Attempting connection...\n');

try {
  const conn = await mongoose.connect(mongoUri);
  
  console.log('✅ CONNECTION SUCCESSFUL!\n');
  console.log('📊 Connection Details:');
  console.log('   Host:', conn.connection.host);
  console.log('   Database:', conn.connection.name);
  console.log('   Port:', conn.connection.port);
  
  // Test reading users
  const User = mongoose.model('User', new mongoose.Schema({
    email: String,
    username: String,
    isEmailVerified: Boolean,
    isActive: Boolean
  }), 'users');
  
  const userCount = await User.countDocuments();
  console.log('\n👥 Users in database:', userCount);
  
  const admin = await User.findOne({ email: 'admin@bitsolidus.tech' });
  if (admin) {
    console.log('\n✅ Admin user exists:');
    console.log('   Email:', admin.email);
    console.log('   Username:', admin.username);
    console.log('   Email Verified:', admin.isEmailVerified ? '✅ YES' : '❌ NO');
    console.log('   Account Active:', admin.isActive ? '✅ YES' : '❌ NO');
  } else {
    console.log('\n⚠️ Admin user NOT found!');
    console.log('Run: npm run seed');
  }
  
  console.log('\n✅ DATABASE IS WORKING CORRECTLY!\n');
  process.exit(0);
  
} catch (error) {
  console.error('\n❌ CONNECTION FAILED!\n');
  console.error('Error:', error.message);
  console.error('\n🔧 Troubleshooting Steps:\n');
  console.error('1. Check if MongoDB URI is correct');
  console.error('2. Ensure MongoDB Atlas allows connections from your IP');
  console.error('3. Verify MongoDB service is running');
  console.error('4. Check firewall settings\n');
  process.exit(1);
}
