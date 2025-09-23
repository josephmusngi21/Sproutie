const express = require('express');
const User = require('../models/User');
const router = express.Router();

// POST /api/users - Create user in MongoDB after Firebase registration
router.post('/', async (req, res) => {
  try {
    const { firebaseUid, email, displayName, emailVerified } = req.body;

    // Validate required fields
    if (!firebaseUid || !email) {
      return res.status(400).json({ 
        error: 'Firebase UID and email are required' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ firebaseUid });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'User already exists',
        user: existingUser 
      });
    }

    // Create new user
    const newUser = new User({
      firebaseUid,
      email,
      displayName,
      emailVerified: emailVerified || false
    });

    await newUser.save();
    console.log(`New user created: ${email} (${firebaseUid})`);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: newUser._id,
        firebaseUid: newUser.firebaseUid,
        email: newUser.email,
        displayName: newUser.displayName,
        createdAt: newUser.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating user:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        error: 'User already exists' 
      });
    }

    res.status(500).json({ 
      error: 'Failed to create user' 
    });
  }
});

// GET /api/users/:firebaseUid - Get user by Firebase UID
router.get('/:firebaseUid', async (req, res) => {
  try {
    const user = await User.findByFirebaseUid(req.params.firebaseUid);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

module.exports = router;