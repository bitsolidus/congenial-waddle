import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import { serveUploads } from './config/upload.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import withdrawalRoutes from './routes/withdrawal.js';
import depositRoutes from './routes/deposit.js';
import tradeRoutes from './routes/trade.js';
import adminRoutes from './routes/admin.js';
import marketRoutes from './routes/market.js';
import chatRoutes from './routes/chat.js';

dotenv.config();

const app = express();

// Middleware - Allow both www and non-www domains
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // Allow localhost in development
    if (origin === 'http://localhost:5173') return callback(null, true);
    
    // Allow bitsolidus.io and www.bitsolidus.io
    const allowedDomains = ['bitsolidus.io', 'www.bitsolidus.io'];
    const domain = origin.replace(/^https?:\/\//, '');
    
    if (allowedDomains.includes(domain)) {
      return callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
serveUploads(app);

// Connect to database
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/withdrawal', withdrawalRoutes);
app.use('/api/deposit', depositRoutes);
app.use('/api/trade', tradeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/chat', chatRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.BACKEND_PORT || process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Backend URL: ${process.env.BACKEND_URL || 'https://bitsolidus.tech'}`);
});

export default app;
