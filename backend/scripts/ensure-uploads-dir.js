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

console.log('Ensuring uploads directories exist...');
console.log('Uploads directory:', uploadsDir);
console.log('KYC directory:', kycDir);

try {
  // Create uploads directory if it doesn't exist
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✓ Created uploads directory:', uploadsDir);
  } else {
    console.log('✓ Uploads directory already exists');
  }

  // Create KYC subdirectory if it doesn't exist
  if (!fs.existsSync(kycDir)) {
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

  console.log('\nUploads directory is ready!');
} catch (error) {
  console.error('✗ Error ensuring uploads directory:', error.message);
  process.exit(1);
}
