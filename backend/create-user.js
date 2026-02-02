require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function createTestUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        const testUser = await User.create({
            abhaId: '12345678901234',
            name: 'Test User',
            mobile: '9876543210',
            email: 'test@example.com',
            password: 'test123',
            dateOfBirth: new Date('1990-01-01'),
            gender: 'Male',
            role: 'patient'
        });

        console.log('✅ Test user created:');
        console.log('ABHA ID: 12345678901234');
        console.log('Password: test123');
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

createTestUser();
