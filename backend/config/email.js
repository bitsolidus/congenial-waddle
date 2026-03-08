import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false // Allow self-signed certificates
  },
  connectionTimeout: 10000, // 10 seconds
  socketTimeout: 10000 // 10 seconds
});

// Verify connection
export const verifyEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log('Email service connected successfully');
    return true;
  } catch (error) {
    console.error('Email service connection failed:', error.message);
    return false;
  }
};

// Send email helper
const sendEmail = async (to, subject, html, text) => {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.FROM_NAME || 'BitSolidus'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html
    });
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Email Templates
const getEmailTemplate = (type, data) => {
  const { siteName = 'BitSolidus', siteUrl = 'http://localhost:5173' } = data;
  
  const baseTemplate = (content) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #7c3aed, #4f46e5); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: white; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        .info-box { background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0; }
        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0; }
        .success { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 15px 0; }
        .error { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${siteName}</h1>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ${siteName}. All rights reserved.</p>
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  switch (type) {
    case 'verification':
      return baseTemplate(`
        <h2>Welcome to ${siteName}!</h2>
        <p>Hi ${data.username},</p>
        <p>Thank you for registering with us. To complete your registration and verify your email address, please click the button below:</p>
        <center>
          <a href="${data.verificationLink}" class="button">Verify My Email</a>
        </center>
        <p>Or copy and paste this link into your browser:</p>
        <div class="info-box">
          <code>${data.verificationLink}</code>
        </div>
        <p>This link will expire in 24 hours for security reasons.</p>
        <div class="warning">
          <strong>Didn't create an account?</strong> If you didn't create an account with us, please ignore this email.
        </div>
      `);

    case 'welcome':
      return baseTemplate(`
        <h2>Welcome to ${siteName}, ${data.username}!</h2>
        <div class="success">
          <strong>✓ Email Verified Successfully</strong>
        </div>
        <p>Your email has been verified and your account is now active. Welcome to our community!</p>
        <h3>What's Next?</h3>
        <ul>
          <li>Complete your KYC verification to unlock full features</li>
          <li>Deposit funds to start trading</li>
          <li>Explore our trading platform</li>
        </ul>
        <center>
          <a href="${siteUrl}/dashboard" class="button">Go to Dashboard</a>
        </center>
      `);

    case 'password-reset':
      return baseTemplate(`
        <h2>Password Reset Request</h2>
        <p>Hi ${data.username},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <center>
          <a href="${data.resetLink}" class="button">Reset My Password</a>
        </center>
        <p>Or copy and paste this link into your browser:</p>
        <div class="info-box">
          <code>${data.resetLink}</code>
        </div>
        <p>This link will expire in 1 hour for security reasons.</p>
        <div class="warning">
          <strong>Didn't request this?</strong> If you didn't request a password reset, please ignore this email or contact support if you're concerned.
        </div>
      `);

    case 'kyc-submitted':
      return baseTemplate(`
        <h2>KYC Submission Received</h2>
        <p>Hi ${data.username},</p>
        <div class="success">
          <strong>✓ Your KYC documents have been submitted successfully!</strong>
        </div>
        <p>We have received your identity verification documents and they are now under review.</p>
        <h3>What happens next?</h3>
        <ul>
          <li>Our team will review your documents within 24-48 hours</li>
          <li>You will receive an email notification once the review is complete</li>
          <li>If additional information is needed, we will contact you</li>
        </ul>
        <p>You can check your KYC status anytime in your profile settings.</p>
      `);

    case 'kyc-approved':
      return baseTemplate(`
        <h2>🎉 KYC Verification Approved!</h2>
        <p>Hi ${data.username},</p>
        <div class="success">
          <strong>✓ Your identity has been verified successfully!</strong>
        </div>
        <p>Congratulations! Your KYC verification has been approved. You now have full access to all platform features.</p>
        <h3>What's Unlocked:</h3>
        <ul>
          <li>Unlimited deposits and withdrawals</li>
          <li>Full trading capabilities</li>
          <li>Higher transaction limits</li>
          <li>Priority customer support</li>
        </ul>
        <center>
          <a href="${siteUrl}/dashboard" class="button">Start Trading</a>
        </center>
      `);

    case 'kyc-rejected':
      return baseTemplate(`
        <h2>KYC Verification Update</h2>
        <p>Hi ${data.username},</p>
        <div class="error">
          <strong>✗ Your KYC verification could not be approved</strong>
        </div>
        <p>We reviewed your submitted documents but were unable to verify your identity.</p>
        ${data.rejectionReason ? `<p><strong>Reason:</strong> ${data.rejectionReason}</p>` : ''}
        <h3>What you can do:</h3>
        <ul>
          <li>Review the requirements and ensure all documents are clear and valid</li>
          <li>Submit new documents with better quality</li>
          <li>Contact our support team if you need assistance</li>
        </ul>
        <center>
          <a href="${siteUrl}/kyc" class="button">Resubmit KYC</a>
        </center>
      `);

    default:
      return baseTemplate('<p>Email content not found.</p>');
  }
};

// Export email functions
export const sendVerificationEmail = async (to, username, verificationLink, siteName = 'BitSolidus') => {
  const html = getEmailTemplate('verification', { username, verificationLink, siteName });
  const text = `Welcome to ${siteName}! Hi ${username}, Please verify your email by clicking this link: ${verificationLink}. This link expires in 24 hours.`;
  return sendEmail(to, `Verify Your Email - ${siteName}`, html, text);
};

export const sendWelcomeEmail = async (to, username, siteName = 'BitSolidus', siteUrl = 'http://localhost:5173') => {
  const html = getEmailTemplate('welcome', { username, siteName, siteUrl });
  const text = `Welcome to ${siteName}, ${username}! Your email has been verified successfully. Visit us at ${siteUrl}`;
  return sendEmail(to, `Welcome to ${siteName}!`, html, text);
};

export const sendPasswordResetEmail = async (to, username, resetLink, siteName = 'BitSolidus') => {
  const html = getEmailTemplate('password-reset', { username, resetLink, siteName });
  const text = `Password Reset Request. Hi ${username}, Reset your password here: ${resetLink}. This link expires in 1 hour.`;
  return sendEmail(to, `Password Reset Request - ${siteName}`, html, text);
};

export const sendKycSubmittedEmail = async (to, username, siteName = 'BitSolidus') => {
  const html = getEmailTemplate('kyc-submitted', { username, siteName });
  const text = `KYC Submission Received. Hi ${username}, Your KYC documents have been submitted and are under review.`;
  return sendEmail(to, `KYC Submission Received - ${siteName}`, html, text);
};

export const sendKycApprovedEmail = async (to, username, siteName = 'BitSolidus', siteUrl = 'http://localhost:5173') => {
  const html = getEmailTemplate('kyc-approved', { username, siteName, siteUrl });
  const text = `KYC Verification Approved! Hi ${username}, Your identity has been verified successfully!`;
  return sendEmail(to, `KYC Approved - ${siteName}`, html, text);
};

export const sendKycRejectedEmail = async (to, username, rejectionReason, siteName = 'BitSolidus', siteUrl = 'http://localhost:5173') => {
  const html = getEmailTemplate('kyc-rejected', { username, rejectionReason, siteName, siteUrl });
  const text = `KYC Verification Update. Hi ${username}, Your KYC could not be approved.${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`;
  return sendEmail(to, `KYC Update - ${siteName}`, html, text);
};

// Send deposit notification to admin
export const sendDepositNotificationEmail = async ({ user, deposit }) => {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
  const { siteName = 'BitSolidus' } = {};
  
  const subject = `🚨 New Deposit Confirmation - ${deposit.amount} ${deposit.cryptocurrency}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px;">New Deposit Confirmation</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Action Required</p>
      </div>
      
      <div style="padding: 30px; background: #f9fafb;">
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #1f2937; margin-top: 0;">User Information</h2>
          <p><strong>Username:</strong> ${user.username}</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>User ID:</strong> ${user.id}</p>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #1f2937; margin-top: 0;">Deposit Details</h2>
          <p><strong>Cryptocurrency:</strong> ${deposit.cryptocurrency}</p>
          <p><strong>Amount:</strong> ${deposit.amount} ${deposit.cryptocurrency}</p>
          <p><strong>Network:</strong> ${deposit.network}</p>
          <p><strong>Transaction ID:</strong> <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px;">${deposit.transactionId}</code></p>
          <p><strong>To Address:</strong> <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; word-break: break-all;">${deposit.toAddress}</code></p>
        </div>
        
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px;">
          <p style="margin: 0; color: #92400e;"><strong>⚠️ Action Required:</strong> Please verify this deposit in the admin dashboard and credit the user's account.</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.ADMIN_URL || 'http://localhost:5173/admin'}" 
             style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Go to Admin Dashboard
          </a>
        </div>
      </div>
      
      <div style="background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 12px;">
        <p>This is an automated notification from ${siteName}</p>
      </div>
    </div>
  `;
  
  const text = `
New Deposit Confirmation

User: ${user.username} (${user.email})
Amount: ${deposit.amount} ${deposit.cryptocurrency}
Network: ${deposit.network}
Transaction ID: ${deposit.transactionId}
To Address: ${deposit.toAddress}

Please verify this deposit in the admin dashboard.
  `;
  
  return sendEmail(adminEmail, subject, html, text);
};

export default {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendKycSubmittedEmail,
  sendKycApprovedEmail,
  sendKycRejectedEmail,
  sendDepositNotificationEmail,
  verifyEmailConnection
};
