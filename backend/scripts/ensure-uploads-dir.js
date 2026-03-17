/**
 * Script to ensure uploads directory exists
 * Run this before starting the server to prevent upload errors
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get uploads directory from environment or use default
const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, '..', 'uploads');
const kycDir = path.join(uploadsDir, 'kyc');

console.log('========================================');
console.log('Ensuring uploads directories exist...');
console.log('========================================');
console.log('Environment UPLOADS_DIR:', process.env.UPLOADS_DIR || '(not set)');
console.log('Resolved uploads directory:', uploadsDir);
console.log('KYC directory:', kycDir);
console.log('Current working directory:', process.cwd());
console.log('__dirname:', __dirname);
console.log('========================================');

try {
  // Check if parent directory exists
  const parentDir = path.dirname(uploadsDir);
  console.log('Parent directory:', parentDir);
  console.log('Parent exists:', fs.existsSync(parentDir));
  
  // Create uploads directory if it doesn't exist
  if (!fs.existsSync(uploadsDir)) {
    console.log('Creating uploads directory...');
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✓ Created uploads directory:', uploadsDir);
  } else {
    console.log('✓ Uploads directory already exists');
  }

  // Verify directory exists after creation attempt
  if (!fs.existsSync(uploadsDir)) {
    throw new Error(`Failed to create uploads directory: ${uploadsDir}`);
  }

  // Create KYC subdirectory if it doesn't exist
  if (!fs.existsSync(kycDir)) {
    console.log('Creating KYC directory...');
    fs.mkdirSync(kycDir, { recursive: true });
    console.log('✓ Created KYC directory:', kycDir);
  } else {
    console.log('✓ KYC directory already exists');
  }

  // Test write permissions
  const testFile = path.join(uploadsDir, '.write-test');
  fs.writeFileSync(testFile, 'test');
  fs.unlinkSync(testFile);
  console.log('✓ Write permissions verified');

  // List directory contents
  const files = fs.readdirSync(uploadsDir);
  console.log('✓ Directory contents:', files.length, 'items');

  console.log('\n========================================');
  console.log('Uploads directory is ready!');
  console.log('========================================');
} catch (error) {
  console.error('\n========================================');
  console.error('✗ Error ensuring uploads directory:');
  console.error('Message:', error.message);
  console.error('Code:', error.code);
  console.error('========================================');
  // Don't exit - let the server try to start anyway
  console.log('Continuing despite error...');
}
