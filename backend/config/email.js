const sendgrid = require('@sendgrid/mail');

// Set SendGrid API key
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

// Send verification email
const sendVerificationEmail = async (email, token) => {
  const backendUrl = process.env.BACKEND_URL || 'https://secure-auth-system-s6ez.onrender.com';
  const verificationUrl = `${backendUrl}/api/auth/verify-email/${token}`;
  const fromEmail = process.env.FROM_EMAIL || 'rjranjit099@gmail.com';

  const msg = {
    to: email,
    from: {
      email: fromEmail,
      name: 'Secure Auth System'
    },
    subject: 'Email Verification - Secure Auth System',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Secure Auth System!</h1>
          </div>
          <div class="content">
            <h2>Verify Your Email Address</h2>
            <p>Thank you for registering! Please click the button below to verify your email address:</p>
            <a href="${verificationUrl}" class="button" style="color: white !important; text-decoration: none;">Verify Email</a>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #4F46E5;">${verificationUrl}</p>
            <p style="margin-top: 30px; color: #666;">This link will expire in 24 hours.</p>
            <p style="color: #666;">If you didn't create an account, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2026 Secure Auth System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await sendgrid.send(msg);
    console.log(`✅ Verification email sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    if (error.response) {
      console.error('SendGrid error details:', error.response.body);
    }
    throw new Error('Failed to send verification email');
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  const fromEmail = process.env.FROM_EMAIL || 'rjranjit099@gmail.com';

  const msg = {
    to: email,
    from: {
      email: fromEmail,
      name: 'Secure Auth System'
    },
    subject: 'Password Reset - Secure Auth System',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #DC2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #DC2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Reset Your Password</h2>
            <p>You requested to reset your password. Click the button below to proceed:</p>
            <a href="${resetUrl}" class="button" style="color: white !important; text-decoration: none;">Reset Password</a>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #DC2626;">${resetUrl}</p>
            <p style="margin-top: 30px; color: #666;">This link will expire in 1 hour.</p>
            <p style="color: #666;">If you didn't request a password reset, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2026 Secure Auth System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await sendgrid.send(msg);
    console.log(`✅ Password reset email sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    if (error.response) {
      console.error('SendGrid error details:', error.response.body);
    }
    throw new Error('Failed to send password reset email');
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};
