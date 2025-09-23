const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Firebase authentication data
  firebaseUid: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  
  // Basic profile
  email: { 
    type: String, 
    required: true,
    lowercase: true 
  },
  displayName: { type: String },
  emailVerified: { type: Boolean, default: false },
  
  // Account status
  isActive: { type: Boolean, default: true },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update timestamp before saving
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to find user by Firebase UID
userSchema.statics.findByFirebaseUid = function(firebaseUid) {
  return this.findOne({ firebaseUid, isActive: true });
};

module.exports = mongoose.model('User', userSchema);