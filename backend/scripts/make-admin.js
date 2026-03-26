const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Script to make a user an admin
async function makeAdmin(email) {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    if (!email) {
      console.error('❌ Please provide an email address');
      console.log('Usage: node scripts/make-admin.js <email>');
      process.exit(1);
    }

    // Find and update user
    const user = await User.findOneAndUpdate(
      { email },
      { 
        isAdmin: true,
        role: 'admin'
      },
      { new: true }
    );

    if (!user) {
      console.error(`❌ No user found with email: ${email}`);
      process.exit(1);
    }

    console.log('✅ User updated successfully!');
    console.log('Username:', user.username);
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('Is Admin:', user.isAdmin);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Get email from command line arguments
const email = process.argv[2];
makeAdmin(email);
