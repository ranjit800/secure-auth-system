const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const Session = require('../models/Session');

// @route   GET /api/dashboard
// @desc    Get dashboard data for authenticated user
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Get user info
    const user = await User.findById(req.userId).select('-passwordHash');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get active session count
    const activeSessionCount = await Session.countDocuments({
      userId: req.userId,
      isActive: true
    });

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
          createdAt: user.createdAt
        },
        stats: {
          activeSessionCount
        }
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data'
    });
  }
});

module.exports = router;
