require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

const seedUsers = async () => {
    try {
        // Clear existing users
        await User.deleteMany({});
        console.log('🗑️ Cleared existing users');

        // Create test user
        const testUser = await User.create({
            abhaId: '12345678901234',
            name: 'Test User',
            mobile: '9876543210',
            email: 'test@example.com',
            password: 'test123',
            dateOfBirth: new Date('1990-01-01'),
            gender: 'Male',
            bloodGroup: 'O+',
            address: 'Test Address',
            role: 'patient'
        });

        console.log('✅ Test user created:');
        console.log('   ABHA ID: 12345678901234');
        console.log('   Password: test123');
        console.log('   Mobile: 9876543210');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
};

const run = async () => {
    await connectDB();
    await seedUsers();
};

run();
