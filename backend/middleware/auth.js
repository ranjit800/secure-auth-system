const jwt = require('jsonwebtoken');
const Session = require('../models/Session');

const authMiddleware = async (req, res, next) => {
  try {
    // Extract JWT from cookie
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.'
      });
    }

    // Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token. Please log in again.'
      });
    }

    // Check if session exists and is active
    const session = await Session.findOne({
      sessionId: decoded.sessionId,
      userId: decoded.userId,
      isActive: true
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Session expired or invalid. Please log in again.'
      });
    }

    // Update last active timestamp
    session.lastActive = new Date();
    await session.save();

    // Attach user info to request
    req.userId = decoded.userId;
    req.sessionId = decoded.sessionId;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

module.exports = authMiddleware;
