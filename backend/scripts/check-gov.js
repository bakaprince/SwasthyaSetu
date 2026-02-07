require('dotenv').config();
const mongoose = require('mongoose');
const GovernmentUser = require('../models/GovernmentUser');
const connectDB = require('../config/database');

const checkGovUser = async () => {
    try {
        await connectDB();

        console.log('--- Database Diagnostic ---');
        console.log('URI:', process.env.MONGODB_URI ? 'Defined' : 'UNDEFINED');

        const count = await GovernmentUser.countDocuments();
        console.log('Total Government Users:', count);

        const user = await GovernmentUser.findOne({ username: 'admin_gov' });
        if (user) {
            console.log('✅ User "admin_gov" FOUND.');
            console.log('User details:', {
                id: user._id,
                username: user.username,
                role: user.role
            });
        } else {
            console.log('❌ User "admin_gov" NOT FOUND.');

            // Show all users in the collection just in case
            const allUsers = await GovernmentUser.find({});
            console.log('All usernames in collection:', allUsers.map(u => u.username));
        }

        process.exit();
    } catch (error) {
        console.error('Diagnostic error:', error);
        process.exit(1);
    }
};

checkGovUser();
