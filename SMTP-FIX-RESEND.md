# 🚨 SMTP Blocked on Render - Switch to Resend

## ❌ **The Problem:**

Render **blocks outbound SMTP connections** on port 587/465 for security reasons.

```
❌ Error: connect ENETUNREACH
❌ Error: Connection timeout
```

Gmail SMTP won't work from Render!

---

## ✅ **Solution: Use Resend API**

Resend is a modern email API that:
- ✅ Works perfectly on Render
- ✅ Free tier: 3,000 emails/month  
- ✅ Better deliverability
- ✅ No SMTP ports needed
- ✅ 2-minute setup

---

## 📝 **Setup Steps:**

### **1. Create Resend Account** (2 minutes)

1. **Go to:** https://resend.com/signup
2. **Sign up** with GitHub or email
3. **Verify your email**

### **2. Get API Key**

1. **Dashboard** → **API Keys**
2. **Create API Key**
3. **Copy the key:** `re_xxxxxxxxxx`

### **3. Add Domain (Optional)**

For now, you can send from `onboarding@resend.dev` (their domain)

Later, add your own domain for professional emails.

---

## 🔧 **Update Backend Code:**

### **Install Resend:**

```bash
cd backend
npm install resend
```

### **Update Environment Variables in Render:**

**Remove:**
- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_USER` (keep for "from" address)
- `EMAIL_PASSWORD`

**Add:**
```
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=onboarding@resend.dev
```

---

### **Update `backend/config/email.js`:**

Replace entire file with:

```javascript
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// Send verification email
const sendVerificationEmail = async (email, token) => {
  const backendUrl = process.env.BACKEND_URL || 'https://secure-auth-system-s6ez.onrender.com';
  const verificationUrl = `${backendUrl}/api/auth/verify-email/${token}`;

  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
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
              <a href="${verificationUrl}" class="button">Verify Email</a>
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
      `,
    });

    console.log(`✅ Verification email sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
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
              <a href="${resetUrl}" class="button">Reset Password</a>
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
      `,
    });

    console.log(`✅ Password reset email sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};
```

---

## 🎯 **Alternative: Gmail with Port 465 (Try First)**

Before

 switching to Resend, try updating SMTP to use port 465:

**In Render → Environment:**
```
EMAIL_PORT=465
```

Then redeploy and test. If still fails, switch to Resend.

---

## ⚡ **Quick Decision:**

**Option 1:** Try Gmail port 465 (5 minutes)
- Update `EMAIL_PORT` in Render to 465
- Redeploy
- Test

**Option 2:** Switch to Resend (10 minutes)  
- Sign up for Resend
- Install package
- Update code
- Deploy
- ✅ Guaranteed to work!

**Which do you prefer?**
