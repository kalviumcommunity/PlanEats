const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function setupAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const email = process.env.ADMIN_EMAIL || 'fibaaminnu@gmail.com';
    let user = await User.findOne({ email });
    
    if (user) {
      console.log('User already exists, updating to admin...');
      user.isAdmin = true;
      user.role = 'admin';
      user.password = 'admin123'; // Default password for setup
      await user.save();
    } else {
      console.log('Creating new admin user...');
      user = new User({
        username: 'admin',
        email: email,
        password: 'admin123',
        isAdmin: true,
        role: 'admin',
        profile: {
          firstName: 'Admin',
          lastName: 'User'
        }
      });
      await user.save();
    }
    
    console.log('Admin setup complete!');
    console.log('Email:', user.email);
    console.log('Password: admin123');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

setupAdmin();
