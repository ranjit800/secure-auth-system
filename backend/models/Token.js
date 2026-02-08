const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  tokenHash: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['VERIFY_EMAIL', 'RESET_PASSWORD']
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  used: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// TTL index to automatically delete expired tokens
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for efficient token lookups
tokenSchema.index({ tokenHash: 1, type: 1 });

const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;
