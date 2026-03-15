import multer from 'multer';
import path from 'path';
import fs from 'fs';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure upload directories exist - Use absolute path relative to backend root
const uploadsBaseDir = process.env.UPLOADS_DIR || path.join(__dirname, '..', 'uploads');
const kycDir = path.join(uploadsBaseDir, 'kyc');

console.log('Uploads directory:', uploadsBaseDir);
console.log('KYC directory:', kycDir);

// Create directories if they don't exist
if (!fs.existsSync(uploadsBaseDir)) {
  fs.mkdirSync(uploadsBaseDir, { recursive: true });
  console.log('Created uploads directory:', uploadsBaseDir);
}
if (!fs.existsSync(kycDir)) {
  fs.mkdirSync(kycDir, { recursive: true });
  console.log('Created KYC directory:', kycDir);
}

// File filter for images
const imageFileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configure KYC storage
const kycStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, kycDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `kyc-${req.user._id}-${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// Configure general/branding storage
const brandingStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsBaseDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// Create multer upload instances
export const upload = multer({
  storage: kycStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 4 // Maximum 4 files
  }
});

// Upload instance for branding assets (logos, favicons, etc.)
export const uploadBranding = multer({
  storage: brandingStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit for branding assets
    files: 1
  }
});

// Serve static files middleware
export const serveUploads = (app) => {
  // Serve uploads with CORS enabled for frontend domain
  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'), {
    setHeaders: (res, path, stat) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    }
  }));
};
