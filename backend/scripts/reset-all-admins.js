const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function resetAdmins() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const admins = await User.find({ isAdmin: true });
    for (const admin of admins) {
      admin.password = 'admin123';
      await admin.save();
      console.log('Reset password for admin:', admin.email);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

resetAdmins();
