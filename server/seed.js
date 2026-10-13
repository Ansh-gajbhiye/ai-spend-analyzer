import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js'; 

const seedUser = async () => {
  try {
    // Try all common variable names
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DB_URI || process.env.MONGO_URL;

    if (!mongoUri) {
      console.error('❌ ERROR: Could not find a MongoDB connection string in your .env file.');
      console.log('Please check your .env file and make sure it has a line like:');
      console.log('MONGO_URI=mongodb://...');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected for seeding...');

    const email = 'admin@remarkflow.com';
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log('User already exists! You can log in now.');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('MySecurePassword123', 10);
    
    await User.create({
      email: email,
      password: hashedPassword,
      // name: 'Admin', // Uncomment if your User model requires a name field
    });

    console.log('🎉 Admin user created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding user:', error);
    process.exit(1);
  }
};

seedUser();