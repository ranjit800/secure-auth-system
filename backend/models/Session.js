const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  deviceInfo: {
    userAgent: { type: String, default: '' },
    deviceType: { type: String, default: 'Unknown' }, // Mobile, Desktop, Tablet
    browser: { type: String, default: 'Unknown' },
    os: { type: String, default: 'Unknown' }
  },
  ipAddress: {
    type: String,
    default: 'Unknown'
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
sessionSchema.index({ userId: 1, isActive: 1 });

// Optional: TTL index to automatically delete inactive sessions after 30 days
// sessionSchema.index({ lastActive: 1 }, { expireAfterSeconds: 2592000 });

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
