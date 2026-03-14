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
const sendEmail = async (to, subject, html, text, replyTo = null) => {
  try {
    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'BitSolidus'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html
    };
    
    // Add reply-to if provided
    if (replyTo) {
      mailOptions.replyTo = replyTo;
    }
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Fetch site config for email branding
const getEmailBranding = async () => {
  try {
    const { default: SiteConfig } = await import('../models/SiteConfig.js');
    const config = await SiteConfig.getConfig();
    
    // Construct full URL for email logo
    let emailLogoUrl = config.emailBranding?.logo || config.logo;
    if (emailLogoUrl && !emailLogoUrl.startsWith('http')) {
      // Prepend backend API URL for email images
      const backendUrl = process.env.BACKEND_URL || process.env.FRONTEND_URL || 'https://bitsolidus.tech';
      emailLogoUrl = `${backendUrl}${emailLogoUrl}`;
    }
    
    return {
      siteName: config.siteName || 'BitSolidus',
      siteUrl: process.env.FRONTEND_URL || 'https://bitsolidus.io',
      emailLogo: emailLogoUrl || 'https://bitsolidus.tech/uploads/footerLogo-1772406666300-176806695.png',
      primaryColor: config.emailBranding?.primaryColor || '#7c3aed',
      secondaryColor: config.emailBranding?.secondaryColor || '#4f46e5',
      supportEmail: config.emailBranding?.supportEmail || config.contact?.email || 'support@bitsolidus.tech',
      replyToEmail: config.emailBranding?.replyToEmail || 'support@bitsolidus.tech',
      supportUrl: config.contact?.supportUrl || 'https://bitsolidus.io/support',
      liveChatUrl: config.contact?.liveChatUrl || 'https://bitsolidus.io/chat',
      showSupportLink: config.emailBranding?.showSupportLink !== false,
      showLiveChatLink: config.emailBranding?.showLiveChatLink !== false
    };
  } catch (error) {
    console.error('Failed to fetch email branding:', error);
    return {
      siteName: 'BitSolidus',
      siteUrl: 'https://bitsolidus.io',
      emailLogo: 'https://bitsolidus.tech/uploads/footerLogo-1772406666300-176806695.png',
      primaryColor: '#7c3aed',
      secondaryColor: '#4f46e5',
      supportEmail: 'support@bitsolidus.tech',
      replyToEmail: 'support@bitsolidus.tech',
      supportUrl: 'https://bitsolidus.io/support',
      liveChatUrl: 'https://bitsolidus.io/chat',
      showSupportLink: true,
      showLiveChatLink: true
    };
  }
};

// Email Templates
const getEmailTemplate = (type, data) => {
  const { 
    siteName = 'BitSolidus', 
    siteUrl = 'https://bitsolidus.io',
    emailLogo = null,
    primaryColor = '#7c3aed',
    secondaryColor = '#4f46e5',
    supportEmail = 'support@bitsolidus.tech',
    supportUrl = 'https://bitsolidus.io/support',
    liveChatUrl = 'https://bitsolidus.io/chat',
    showSupportLink = true,
    showLiveChatLink = true
  } = data;
  
  const logoHtml = emailLogo ? `
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="${emailLogo}" alt="${siteName}" style="max-height: 60px; max-width: 200px;" />
    </div>
  ` : '';
  
  const supportSection = (showSupportLink || showLiveChatLink) ? `
    <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px; text-align: center;">
      <p style="color: #6b7280; font-size: 14px; margin-bottom: 15px;">Need help? We're here for you:</p>
      <div style="display: flex; justify-content: center; gap: 15px; flex-wrap: wrap;">
        ${showSupportLink ? `<a href="${supportUrl}" style="display: inline-block; padding: 10px 20px; background: #f3f4f6; color: #374151; text-decoration: none; border-radius: 6px; font-size: 14px;">📧 Contact Support</a>` : ''}
        ${showLiveChatLink ? `<a href="${liveChatUrl}" style="display: inline-block; padding: 10px 20px; background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor}); color: white; text-decoration: none; border-radius: 6px; font-size: 14px;">💬 Live Chat</a>` : ''}
      </div>
      <p style="color: #9ca3af; font-size: 12px; margin-top: 15px;">
        Or reply to this email at <a href="mailto:${supportEmail}" style="color: ${primaryColor};">${supportEmail}</a>
      </p>
    </div>
  ` : '';
  
  const baseTemplate = (content) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor}); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor}); color: white; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
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
          ${logoHtml}
        </div>
        <div class="content">
          ${content}
          ${supportSection}
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

    case 'login-otp':
      return baseTemplate(`
        <h2>🔐 Login Verification Code</h2>
        <p>Hi ${data.username},</p>
        <p>We received a login request for your account. Please use the following verification code to complete your login:</p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; padding: 20px 40px; background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor}); border-radius: 12px;">
            <span style="font-size: 36px; font-weight: bold; color: white; letter-spacing: 8px;">${data.otp}</span>
          </div>
        </div>
        <p style="text-align: center; color: #6b7280;">This code will expire in <strong>10 minutes</strong>.</p>
        <div class="warning">
          <strong>Security Notice:</strong> If you didn't request this code, please ignore this email and consider changing your password.
        </div>
      `);

    case 'deposit-confirmed':
      return baseTemplate(`
        <h2>✅ Deposit Confirmed!</h2>
        <p>Hi ${data.username},</p>
        <div class="success">
          <strong>✓ Your deposit has been confirmed and credited to your account!</strong>
        </div>
        <p>Great news! Your deposit confirmation has been approved by our team.</p>
        <h3>Deposit Details:</h3>
        <div class="info-box">
          <p><strong>Amount:</strong> ${data.amount} ${data.cryptocurrency}</p>
          <p><strong>Cryptocurrency:</strong> ${data.cryptocurrency}</p>
          <p><strong>Transaction ID:</strong> <code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px;">${data.transactionId}</code></p>
          <p><strong>Status:</strong> ✅ Completed</p>
        </div>
        <p>The funds have been added to your account balance and are now available for trading or withdrawal.</p>
        <center>
          <a href="${siteUrl}/dashboard" class="button">View My Balance</a>
        </center>
        <p>Thank you for using ${siteName}!</p>
      `);

    case 'deposit-rejected':
      return baseTemplate(`
        <h2>⚠️ Deposit Confirmation Update</h2>
        <p>Hi ${data.username},</p>
        <div class="error">
          <strong>✗ Your deposit confirmation could not be approved</strong>
        </div>
        <p>We've reviewed your deposit submission but were unable to process it at this time.</p>
        ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ''}
        <h3>Deposit Details:</h3>
        <div class="info-box">
          <p><strong>Amount:</strong> ${data.amount} ${data.cryptocurrency}</p>
          <p><strong>Cryptocurrency:</strong> ${data.cryptocurrency}</p>
          <p><strong>Transaction ID:</strong> <code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px;">${data.transactionId}</code></p>
        </div>
        <h3>What you can do:</h3>
        <ul>
          <li>Review the transaction details and ensure all information is correct</li>
          <li>Contact our support team if you believe this is an error</li>
          <li>Submit a new deposit confirmation if needed</li>
        </ul>
        <center>
          <a href="${siteUrl}/support" class="button">Contact Support</a>
        </center>
        <p>We apologize for any inconvenience and are here to help resolve this matter.</p>
      `);

    case 'transfer-sent':
      return baseTemplate(`
        <h2>✅ Transfer Sent Successfully!</h2>
        <p>Hi ${data.username},</p>
        <div class="success">
          <strong>✓ Your transfer has been completed successfully!</strong>
        </div>
        <p>Your peer-to-peer transfer has been processed and the funds have been sent.</p>
        <h3>Transfer Details:</h3>
        <div class="info-box">
          <p><strong>Amount Sent:</strong> ${data.amount} ${data.cryptocurrency}</p>
          <p><strong>Recipient:</strong> ${data.recipientUsername}</p>
          <p><strong>Cryptocurrency:</strong> ${data.cryptocurrency}</p>
          <p><strong>Status:</strong> ✅ Completed</p>
        </div>
        <p>The funds have been deducted from your balance and credited to the recipient's account immediately.</p>
        <center>
          <a href="${siteUrl}/transactions" class="button">View Transaction History</a>
        </center>
        <p>Thank you for using ${siteName}!</p>
      `);

    case 'transfer-received':
      return baseTemplate(`
        <h2>💰 You Received a Transfer!</h2>
        <p>Hi ${data.username},</p>
        <div class="success">
          <strong>✓ New funds have been added to your account!</strong>
        </div>
        <p>You've received a peer-to-peer transfer from another user.</p>
        <h3>Transfer Details:</h3>
        <div class="info-box">
          <p><strong>Amount Received:</strong> ${data.amount} ${data.cryptocurrency}</p>
          <p><strong>Sent By:</strong> ${data.senderUsername}</p>
          <p><strong>Cryptocurrency:</strong> ${data.cryptocurrency}</p>
          <p><strong>Status:</strong> ✅ Completed</p>
        </div>
        <p>The funds have been added to your account balance and are now available for trading or withdrawal.</p>
        <center>
          <a href="${siteUrl}/dashboard" class="button">View My Balance</a>
        </center>
        <p>Thank you for using ${siteName}!</p>
      `);

    default:
      return baseTemplate('<p>Email content not found.</p>');
  }
};

// Export email functions
export const sendVerificationEmail = async (to, username, verificationLink, siteName = 'BitSolidus') => {
  const branding = await getEmailBranding();
  const html = getEmailTemplate('verification', { 
    username, 
    verificationLink, 
    siteName: branding.siteName,
    ...branding
  });
  const text = `Welcome to ${branding.siteName}! Hi ${username}, Please verify your email by clicking this link: ${verificationLink}. This link expires in 24 hours.`;
  return sendEmail(to, `Verify Your Email - ${branding.siteName}`, html, text, branding.replyToEmail);
};

export const sendWelcomeEmail = async (to, username, siteName = 'BitSolidus', siteUrl = 'https://bitsolidus.io') => {
  const branding = await getEmailBranding();
  const html = getEmailTemplate('welcome', { username, siteName: branding.siteName, siteUrl: branding.siteUrl, ...branding });
  const text = `Welcome to ${branding.siteName}, ${username}! Your email has been verified successfully. Visit us at ${branding.siteUrl}`;
  return sendEmail(to, `Welcome to ${branding.siteName}!`, html, text, branding.replyToEmail);
};

export const sendPasswordResetEmail = async (to, username, resetLink, siteName = 'BitSolidus') => {
  const branding = await getEmailBranding();
  const html = getEmailTemplate('password-reset', { username, resetLink, siteName: branding.siteName, ...branding });
  const text = `Password Reset Request. Hi ${username}, Reset your password here: ${resetLink}. This link expires in 1 hour.`;
  return sendEmail(to, `Password Reset Request - ${branding.siteName}`, html, text, branding.replyToEmail);
};

export const sendKycSubmittedEmail = async (to, username, siteName = 'BitSolidus') => {
  const branding = await getEmailBranding();
  const html = getEmailTemplate('kyc-submitted', { username, siteName: branding.siteName, ...branding });
  const text = `KYC Submission Received. Hi ${username}, Your KYC documents have been submitted and are under review.`;
  return sendEmail(to, `KYC Submission Received - ${branding.siteName}`, html, text, branding.replyToEmail);
};

export const sendKycApprovedEmail = async (to, username, siteName = 'BitSolidus', siteUrl = 'https://bitsolidus.io') => {
  const branding = await getEmailBranding();
  const html = getEmailTemplate('kyc-approved', { username, siteName: branding.siteName, siteUrl: branding.siteUrl, ...branding });
  const text = `KYC Verification Approved! Hi ${username}, Your identity has been verified successfully!`;
  return sendEmail(to, `KYC Approved - ${branding.siteName}`, html, text, branding.replyToEmail);
};

export const sendKycRejectedEmail = async (to, username, rejectionReason, siteName = 'BitSolidus', siteUrl = 'https://bitsolidus.io') => {
  const branding = await getEmailBranding();
  const html = getEmailTemplate('kyc-rejected', { username, rejectionReason, siteName: branding.siteName, siteUrl: branding.siteUrl, ...branding });
  const text = `KYC Verification Update. Hi ${username}, Your KYC could not be approved.${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`;
  return sendEmail(to, `KYC Update - ${branding.siteName}`, html, text, branding.replyToEmail);
};

// Send deposit notification to admin
export const sendDepositNotificationEmail = async ({ user, deposit }) => {
  const branding = await getEmailBranding();
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
  
  const subject = `🚨 New Deposit Confirmation - ${deposit.amount} ${deposit.cryptocurrency}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <!-- Logo Section -->
      ${branding.emailLogo ? `
        <div style="text-align: center; padding: 20px; background: #f9fafb;">
          <img src="${branding.emailLogo}" alt="${branding.siteName}" style="max-height: 60px; max-width: 200px;" />
        </div>
      ` : ''}
      
      <div style="background: linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor}); padding: 30px; text-align: center; color: white;">
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
          <a href="${process.env.ADMIN_URL || 'https://bitsolidus.io/admin'}"
             style="background: linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor}); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Go to Admin Dashboard
          </a>
        </div>
      </div>
      
      <div style="background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 12px;">
        <p>This is an automated notification from ${branding.siteName}</p>
        ${branding.showSupportLink ? `<p style="margin-top: 10px;"><a href="${branding.supportUrl}" style="color: ${branding.primaryColor};">Contact Support</a> | <a href="${branding.liveChatUrl}" style="color: ${branding.primaryColor};">Live Chat</a></p>` : ''}
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

-- 
${branding.siteName}
${branding.supportUrl}
  `;
  
  return sendEmail(adminEmail, subject, html, text);
};

// Send login OTP email
export const sendLoginOtpEmail = async (to, username, otp) => {
  const branding = await getEmailBranding();
  const html = getEmailTemplate('login-otp', { 
    username, 
    otp,
    siteName: branding.siteName, 
    ...branding 
  });
  const text = `Your ${branding.siteName} Login Verification Code: ${otp}. This code expires in 10 minutes.`;
  return sendEmail(to, `🔐 Login Verification Code - ${branding.siteName}`, html, text, branding.replyToEmail);
};

// Send deposit confirmed email to user
export const sendDepositConfirmedEmail = async (to, username, deposit) => {
  const branding = await getEmailBranding();
  const html = getEmailTemplate('deposit-confirmed', { 
    username, 
    amount: deposit.amount,
    cryptocurrency: deposit.cryptocurrency,
    transactionId: deposit.transactionId,
    siteName: branding.siteName,
    siteUrl: branding.siteUrl,
    ...branding 
  });
  const text = `Deposit Confirmed! Hi ${username}, Your deposit of ${deposit.amount} ${deposit.cryptocurrency} (TxID: ${deposit.transactionId}) has been confirmed and credited to your account.`;
  return sendEmail(to, `✅ Deposit Confirmed - ${deposit.amount} ${deposit.cryptocurrency}`, html, text, branding.replyToEmail);
};

// Send deposit rejected email to user
export const sendDepositRejectedEmail = async (to, username, deposit, reason = '') => {
  const branding = await getEmailBranding();
  const html = getEmailTemplate('deposit-rejected', { 
    username, 
    amount: deposit.amount,
    cryptocurrency: deposit.cryptocurrency,
    transactionId: deposit.transactionId,
    reason,
    siteName: branding.siteName,
    siteUrl: branding.siteUrl,
    ...branding 
  });
  const text = `Deposit Update. Hi ${username}, Your deposit confirmation could not be approved.${reason ? ` Reason: ${reason}` : ''} Amount: ${deposit.amount} ${deposit.cryptocurrency} (TxID: ${deposit.transactionId}). Please contact support.`;
  return sendEmail(to, `⚠️ Deposit Confirmation Update`, html, text, branding.replyToEmail);
};

// Send transfer sent confirmation email to sender
export const sendTransferSentEmail = async (to, username, transfer) => {
  const branding = await getEmailBranding();
  const html = getEmailTemplate('transfer-sent', { 
    username, 
    amount: transfer.amount,
    cryptocurrency: transfer.cryptocurrency,
    recipientUsername: transfer.recipientUsername,
    siteName: branding.siteName,
    siteUrl: branding.siteUrl,
    ...branding 
  });
  const text = `Transfer Sent! Hi ${username}, You successfully sent ${transfer.amount} ${transfer.cryptocurrency} to ${transfer.recipientUsername}. The transfer has been completed.`;
  return sendEmail(to, `✅ Transfer Sent - ${transfer.amount} ${transfer.cryptocurrency}`, html, text, branding.replyToEmail);
};

// Send transfer received notification email to recipient
export const sendTransferReceivedEmail = async (to, username, transfer) => {
  const branding = await getEmailBranding();
  const html = getEmailTemplate('transfer-received', { 
    username, 
    amount: transfer.amount,
    cryptocurrency: transfer.cryptocurrency,
    senderUsername: transfer.senderUsername,
    siteName: branding.siteName,
    siteUrl: branding.siteUrl,
    ...branding 
  });
  const text = `You Received a Transfer! Hi ${username}, You received ${transfer.amount} ${transfer.cryptocurrency} from ${transfer.senderUsername}. The funds have been added to your account.`;
  return sendEmail(to, `💰 Transfer Received - ${transfer.amount} ${transfer.cryptocurrency}`, html, text, branding.replyToEmail);
};

export default {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendKycSubmittedEmail,
  sendKycApprovedEmail,
  sendKycRejectedEmail,
  sendDepositNotificationEmail,
  sendLoginOtpEmail,
  sendDepositConfirmedEmail,
  sendDepositRejectedEmail,
  sendTransferSentEmail,
  sendTransferReceivedEmail,
  verifyEmailConnection
};
