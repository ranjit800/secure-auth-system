const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const authMiddleware = require('../middleware/auth');

// @route   GET /api/sessions
// @desc    Get all active sessions for current user
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const sessions = await Session.find({
      userId: req.userId,
      isActive: true
    }).sort({ lastActive: -1 });

    const sessionData = sessions.map(session => ({
      sessionId: session.sessionId,
      deviceInfo: {
        deviceType: session.deviceInfo.deviceType,
        browser: session.deviceInfo.browser,
        os: session.deviceInfo.os
      },
      ipAddress: session.ipAddress,
      lastActive: session.lastActive,
      createdAt: session.createdAt,
      isCurrent: session.sessionId === req.sessionId
    }));

    res.status(200).json({
      success: true,
      data: {
        sessions: sessionData,
        totalSessions: sessionData.length
      }
    });

  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching sessions'
    });
  }
});

// @route   DELETE /api/sessions/:sessionId
// @desc    Revoke a specific session
// @access  Private
router.delete('/:sessionId', authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Find and verify session belongs to current user
    const session = await Session.findOne({
      sessionId,
      userId: req.userId
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Mark session as inactive
    session.isActive = false;
    await session.save();

    res.status(200).json({
      success: true,
      message: 'Session revoked successfully'
    });

  } catch (error) {
    console.error('Revoke session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while revoking session'
    });
  }
});

module.exports = router;
