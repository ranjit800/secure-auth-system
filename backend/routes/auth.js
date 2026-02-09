const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const User = require('../models/User');
const Session = require('../models/Session');
const Token = require('../models/Token');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../config/email');
const { parseUserAgent, getClientIp } = require('../utils/helpers');
const authMiddleware = require('../middleware/auth');
const { loginLimiter, registerLimiter, passwordResetLimiter } = require('../middleware/rateLimit');

// Helper function to hash tokens
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash
    });

    // Generate verification token
    const verificationToken = uuidv4();
    const tokenHash = hashToken(verificationToken);

    // Save token to database
    await Token.create({
      userId: user._id,
      tokenHash,
      type: 'VERIFY_EMAIL',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail registration if email fails
    }

    // Prepare response
    const responseData = {
      email: user.email,
      isEmailVerified: user.isEmailVerified
    };

    // In development, include the verification token for testing
    if (process.env.NODE_ENV === 'development') {
      responseData.verificationToken = verificationToken;
      responseData.verificationUrl = `http://localhost:5000/api/auth/verify-email/${verificationToken}`;
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      data: responseData
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   GET /api/auth/verify-email/:token
// @desc    Verify user's email
// @access  Public
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    // Hash the token
    const tokenHash = hashToken(token);

    // Find the token
    const tokenDoc = await Token.findOne({
      tokenHash,
      type: 'VERIFY_EMAIL',
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!tokenDoc) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/login?verified=false&error=invalid-token`);
    }

    // Mark token as used
    tokenDoc.used = true;
    await tokenDoc.save();

    // Update user's verification status
    await User.findByIdAndUpdate(tokenDoc.userId, {
      isEmailVerified: true
    });

    // Redirect to frontend login page with success message
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/login?verified=true`);

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during email verification'
    });
  }
});


// @route   POST /api/auth/login
// @desc    Login user (WITH RACE CONDITION HANDLING)
// @access  Public
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in'
      });
    }

    // Extract device information
    const userAgent = req.headers['user-agent'] || '';
    const ipAddress = getClientIp(req);
    const { deviceType, browser, os } = parseUserAgent(userAgent);

    // Generate unique session ID
    const sessionId = uuidv4();

    // RACE CONDITION HANDLING: Use atomic operation to create session
    // This ensures that even if two login requests happen simultaneously,
    // MongoDB will handle them sequentially, preventing duplicate sessions
    const session = await Session.create({
      userId: user._id,
      sessionId,
      deviceInfo: {
        userAgent,
        deviceType,
        browser,
        os
      },
      ipAddress,
      isActive: true,
      lastActive: new Date()
    });

    // Generate JWT with sessionId embedded
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        sessionId: session.sessionId
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Set HTTP-only cookie
    // Note: For localhost development with deployed backend, we use sameSite: 'none' with secure: true
    // This allows cookies to work across origins (localhost -> Render)
    const isProduction = process.env.NODE_ENV === 'production';
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: true, // Always true for sameSite: 'none' to work
      sameSite: 'none', // Allow cross-origin cookies (localhost -> deployed backend)
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          isEmailVerified: user.isEmailVerified
        },
        session: {
          sessionId: session.sessionId,
          deviceType,
          browser,
          os,
          ipAddress
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    
    // Handle duplicate key error (rare case with race conditions)
    if (error.code === 11000) {
      return res.status(500).json({
        success: false,
        message: 'Login conflict. Please try again.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout from current device
// @access  Private
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    // Mark current session as inactive
    await Session.findOneAndUpdate(
      { sessionId: req.sessionId },
      { isActive: false }
    );

    // Clear cookie
    res.clearCookie('token');

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
});

// @route   POST /api/auth/logout-all
// @desc    Logout from all devices
// @access  Private
router.post('/logout-all', authMiddleware, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);

    // Mark all user's sessions as inactive
    const result = await Session.updateMany(
      { userId: userId, isActive: true },
      { isActive: false }
    );

    console.log(`Logout all: Invalidated ${result.modifiedCount} sessions for user ${req.userId}`);

    // Clear cookie
    res.clearCookie('token');

    res.status(200).json({
      success: true,
      message: 'Logged out from all devices successfully',
      count: result.modifiedCount
    });

  } catch (error) {
    console.error('Logout all error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password', passwordResetLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email address'
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    
    // Always return success to prevent email enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = uuidv4();
    const tokenHash = hashToken(resetToken);

    // Save token to database
    await Token.create({
      userId: user._id,
      tokenHash,
      type: 'RESET_PASSWORD',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    });

    // Send reset email
    try {
      await sendPasswordResetEmail(email, resetToken);
    } catch (emailError) {
      console.error('Password reset email failed:', emailError);
    }

    // Prepare response
    const responseMessage = 'If an account with that email exists, a password reset link has been sent.';
    const responseData = {
      success: true,
      message: responseMessage
    };

    // In development, include the reset token for testing
    if (process.env.NODE_ENV === 'development' && user) {
      responseData.resetToken = resetToken;
      responseData.resetUrl = `http://localhost:5000/api/auth/reset-password`;
      responseData.note = 'Use the resetToken in your POST request body';
    }

    res.status(200).json(responseData);

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset request'
    });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password
// @access  Public
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide token and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Hash the token
    const tokenHash = hashToken(token);

    // Find the token
    const tokenDoc = await Token.findOne({
      tokenHash,
      type: 'RESET_PASSWORD',
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!tokenDoc) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Mark token as used
    tokenDoc.used = true;
    await tokenDoc.save();

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update user's password
    await User.findByIdAndUpdate(tokenDoc.userId, { passwordHash });

    // Invalidate all sessions for security
    await Session.updateMany(
      { userId: tokenDoc.userId, isActive: true },
      { isActive: false }
    );

    res.status(200).json({
      success: true,
      message: 'Password reset successful! Please log in with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset'
    });
  }
});

module.exports = router;
