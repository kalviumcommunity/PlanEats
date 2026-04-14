const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function findAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const admins = await User.find({ isAdmin: true });
    if (admins.length > 0) {
      console.log('Admin Users Found:');
      admins.forEach(admin => {
        console.log('Username:', admin.username);
        console.log('Email:', admin.email);
        console.log('Role:', admin.role);
        console.log('---');
      });
    } else {
      console.log('No admin users found.');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

findAdmin();
