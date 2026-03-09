import express from 'express';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import { generateToken } from '../middleware/auth.js';
import { 
  sendVerificationEmail, 
  sendWelcomeEmail,
  sendPasswordResetEmail 
} from '../config/email.js';

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  '/register',
  [
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    handleValidationErrors
  ],
  async (req, res) => {
    try {
      const { username, email, password, country, currency } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }]
      });

      if (existingUser) {
        return res.status(400).json({
          message: existingUser.email === email 
            ? 'Email already registered' 
            : 'Username already taken'
        });
      }

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Create new user with country and currency
      const user = await User.create({
        username,
        email,
        password,
        country: country || null,
        settings: {
          currency: currency || 'USD',
          language: 'en',
          theme: 'auto',
          notifications: true
        },
        balance: 0.00,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires
      });

      // Send verification email (non-blocking)
      const verificationLink = `${process.env.FRONTEND_URL || 'https://bitsolidus.io'}/verify-email?token=${verificationToken}`;
      // Fire and forget - don't await, don't block registration
      sendVerificationEmail(email, username, verificationLink).catch(emailError => {
        console.error('Failed to send verification email:', emailError.message);
      });

      // Don't return token - user needs to verify email first
      res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          emailVerified: user.isEmailVerified
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error during registration' });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    handleValidationErrors
  ],
  async (req, res) => {
    try {
      const { email, password, rememberMe } = req.body;

      // Find user by email
      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        return res.status(401).json({ message: 'Incorrect email or password. Please try again.' });
      }

      // Check if account is active
      if (!user.isActive) {
        return res.status(401).json({ message: 'Your account has been deactivated. Please contact support.' });
      }

      // Check password
      const isMatch = await user.comparePassword(password);

      if (!isMatch) {
        return res.status(401).json({ message: 'Incorrect email or password. Please try again.' });
      }

      // Ensure settings object exists
      if (!user.settings) {
        user.settings = {
          currency: 'USD',
          language: 'en',
          theme: 'auto',
          notifications: true
        };
      }
      
      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Log login activity
      await ActivityLog.create({
        userId: user._id,
        type: 'login',
        title: 'User Login',
        description: 'User logged in successfully',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        severity: 'info'
      });

      // Generate token
      const token = generateToken(user._id);

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          balance: user.balance,
          tier: user.tier,
          kycStatus: user.kycStatus,
          kycData: user.kycData,
          walletAddress: user.walletAddress,
          settings: user.settings,
          isAdmin: user.isAdmin,
          country: user.country,
          currency: user.settings?.currency || 'USD'
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error during login' });
    }
  }
);

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post(
  '/forgot-password',
  [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    handleValidationErrors
  ],
  async (req, res) => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
        // Don't reveal if email exists
        return res.json({
          success: true,
          message: 'If an account exists with this email, you will receive password reset instructions'
        });
      }

      // In a real implementation, send email with reset token
      // For now, just return success message
      res.json({
        success: true,
        message: 'If an account exists with this email, you will receive password reset instructions'
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   POST /api/auth/admin-login
// @desc    Admin login
// @access  Public
router.post(
  '/admin-login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
    handleValidationErrors
  ],
  async (req, res) => {
    try {
      const { email, password, twoFactorCode } = req.body;

      // Check hardcoded admin credentials for demo
      if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
        // Find or create admin user
        let admin = await User.findOne({ email });
        
        if (!admin) {
          admin = await User.create({
            username: 'admin',
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD,
            isAdmin: true,
            balance: 0
          });
        }

        const token = generateToken(admin._id);

        return res.json({
          success: true,
          message: 'Admin login successful',
          token,
          user: {
            id: admin._id,
            username: admin.username,
            email: admin.email,
            isAdmin: true
          }
        });
      }

      // Check if user exists and is admin
      const user = await User.findOne({ email }).select('+password');

      if (!user || !user.isAdmin) {
        return res.status(401).json({ message: 'Invalid admin credentials' });
      }

      const isMatch = await user.comparePassword(password);

      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid admin credentials' });
      }

      // Check 2FA if enabled
      if (user.twoFactorEnabled) {
        // In real implementation, verify 2FA code
        if (!twoFactorCode) {
          return res.status(401).json({ message: '2FA code required' });
        }
      }

      const token = generateToken(user._id);

      res.json({
        success: true,
        message: 'Admin login successful',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          isAdmin: true
        }
      });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   GET /api/auth/verify-email
// @desc    Verify user email with token
// @access  Public
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    // Update user
    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.username);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    // Create admin notification
    try {
      const { default: Notification } = await import('../models/Notification.js');
      await Notification.create({
        userId: null, // System notification for admins
        type: 'email_verified',
        title: 'Email Verified',
        message: `${user.username} (${user.email}) has verified their email address.`,
        data: {
          userId: user._id,
          username: user.username,
          email: user.email,
          verifiedAt: new Date()
        }
      });
    } catch (notifError) {
      console.error('Failed to create admin notification:', notifError);
    }

    // Send admin email notification
    try {
      const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
      if (adminEmail) {
        const subject = '✅ New Email Verification - BitSolidus';
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 24px;">Email Verified</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">A user has verified their email</p>
            </div>
            <div style="padding: 30px; background: #f9fafb;">
              <div style="background: white; padding: 20px; border-radius: 8px;">
                <h2 style="color: #1f2937; margin-top: 0;">User Details</h2>
                <p><strong>Username:</strong> ${user.username}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Verified At:</strong> ${new Date().toLocaleString()}</p>
              </div>
              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.ADMIN_URL || 'https://bitsolidus.io/admin'}/users/${user._id}" 
                   style="background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  View User Profile
                </a>
              </div>
            </div>
          </div>
        `;
        const text = `Email Verified - ${user.username} (${user.email}) has verified their email address.`;
        
        // Use nodemailer directly for custom admin emails
        const nodemailer = await import('nodemailer');
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: process.env.SMTP_PORT || 587,
          secure: process.env.SMTP_PORT === '465',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          },
          tls: {
            rejectUnauthorized: false
          }
        });
        
        await transporter.sendMail({
          from: `"${process.env.FROM_NAME || 'BitSolidus'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
          to: adminEmail,
          subject,
          text,
          html
        });
      }
    } catch (adminEmailError) {
      console.error('Failed to send admin notification email:', adminEmailError);
    }

    res.json({
      success: true,
      message: 'Email verified successfully! You can now log in.'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/resend-verification
// @desc    Resend verification email
// @access  Public
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    // Send verification email
    const verificationLink = `${process.env.FRONTEND_URL || 'https://bitsolidus.io'}/verify-email?token=${verificationToken}`;
    try {
      await sendVerificationEmail(email, user.username, verificationLink);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      return res.status(500).json({ message: 'Failed to send verification email' });
    }

    res.json({
      success: true,
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Send password reset email
    const resetLink = `${process.env.FRONTEND_URL || 'https://bitsolidus.io'}/reset-password?token=${resetToken}`;
    try {
      await sendPasswordResetEmail(email, user.username, resetLink);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      return res.status(500).json({ message: 'Failed to send password reset email' });
    }

    res.json({
      success: true,
      message: 'Password reset email sent. Please check your inbox.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update password
    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful. You can now log in with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
