require('dotenv').config();
const mongoose = require('mongoose');
const GovernmentUser = require('../models/GovernmentUser');
const connectDB = require('../config/database');

const seedGovUser = async () => {
    try {
        await connectDB();

        // Check if exists
        const exists = await GovernmentUser.findOne({ username: 'admin_gov' });
        if (exists) {
            console.log('Government user already exists.');
            process.exit();
        }

        const user = await GovernmentUser.create({
            username: 'admin_gov',
            password: 'gov_password_123',
            department: 'MoHFW (Ministry of Health & Family Welfare)',
            email: 'admin@mohfw.gov.in'
        });

        console.log(`Government user created: ${user.username}`);
        process.exit();
    } catch (error) {
        console.error('Error seeding government user:', error);
        process.exit(1);
    }
};

seedGovUser();
