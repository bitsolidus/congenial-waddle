import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const fixIndex = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Drop the internalWallet unique index
    console.log('Dropping internalWallet index...');
    await mongoose.connection.collection('users').dropIndex('internalWallet_1');
    console.log('Successfully dropped internalWallet_1 index');

    // Create a new sparse index without unique constraint
    console.log('Creating new sparse index...');
    await mongoose.connection.collection('users').createIndex(
      { internalWallet: 1 },
      { sparse: true, background: true }
    );
    console.log('Successfully created new sparse index');

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    if (error.message.includes('index not found')) {
      console.log('Index does not exist, creating new sparse index...');
      try {
        await mongoose.connection.collection('users').createIndex(
          { internalWallet: 1 },
          { sparse: true, background: true }
        );
        console.log('Successfully created sparse index');
        process.exit(0);
      } catch (err) {
        console.error('Error creating index:', err);
        process.exit(1);
      }
    } else {
      console.error('Migration error:', error);
      process.exit(1);
    }
  }
};

fixIndex();
