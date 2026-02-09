const rateLimit = require('express-rate-limit');

// Helper function to get human-readable time remaining
const getTimeRemaining = (resetTime) => {
  const now = Date.now();
  const resetTimeMs = resetTime * 1000; // Convert seconds to milliseconds
  const msRemaining = resetTimeMs - now;
  const minutesRemaining = Math.ceil(msRemaining / 60000);
  
  if (minutesRemaining < 1) {
    return 'less than a minute';
  } else if (minutesRemaining === 1) {
    return '1 minute';
  } else if (minutesRemaining < 60) {
    return `${minutesRemaining} minutes`;
  } else {
    const hours = Math.floor(minutesRemaining / 60);
    const mins = minutesRemaining % 60;
    if (mins === 0) {
      return hours === 1 ? '1 hour' : `${hours} hours`;
    }
    return `${hours} hour${hours > 1 ? 's' : ''} and ${mins} minute${mins > 1 ? 's' : ''}`;
  }
};

// Rate limiter for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const resetTime = parseInt(res.getHeader('RateLimit-Reset'));
    const now = Date.now();
    const resetTimeMs = resetTime * 1000;
    
    // Debug logging
    console.log('Rate Limit Debug:', {
      resetTime,
      resetTimeMs,
      now,
      diff: resetTimeMs - now,
      minutes: Math.ceil((resetTimeMs - now) / 60000)
    });
    
    const timeRemaining = getTimeRemaining(resetTime);
    
    res.status(429).json({
      success: false,
      message: `Too many login attempts. Please try again in ${timeRemaining}.`
    });
  }
});

// Rate limiter for registration
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per hour per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const resetTime = parseInt(res.getHeader('RateLimit-Reset'));
    const timeRemaining = getTimeRemaining(resetTime);
    
    res.status(429).json({
      success: false,
      message: `Too many registration attempts. Please try again in ${timeRemaining}.`
    });
  }
});

// Rate limiter for password reset
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 reset requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const resetTime = parseInt(res.getHeader('RateLimit-Reset'));
    const timeRemaining = getTimeRemaining(resetTime);
    
    res.status(429).json({
      success: false,
      message: `Too many password reset requests. Please try again in ${timeRemaining}.`
    });
  }
});

module.exports = {
  loginLimiter,
  registerLimiter,
  passwordResetLimiter
};
