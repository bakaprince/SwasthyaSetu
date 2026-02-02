const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

const resetUser = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected.');

        const abhaId = '12-3456-7890-1234';
        const passwordPlain = 'patient123';

        // Hash the password manually to be sure
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(passwordPlain, salt);

        console.log(`\n🔄 Updating/Creating user with ABHA ID: "${abhaId}"...`);

        // Upsert operation
        const result = await User.findOneAndUpdate(
            { abhaId },
            {
                $set: {
                    name: 'Rahul Kumar', // Ensure name is correct
                    mobile: '9876543210',
                    password: hashedPassword, // Set the KNOWN hashed password
                    role: 'patient'
                },
                $setOnInsert: {
                    email: 'rahul.kumar@example.com',
                    dateOfBirth: new Date('1990-05-15'),
                    gender: 'Male',
                    address: 'Sector 15, Noida, UP'
                }
            },
            { new: true, upsert: true }
        );

        console.log('✅ User updated successfully!');
        console.log(`   ID: ${result._id}`);
        console.log(`   ABHA: ${result.abhaId}`);
        console.log(`   Password set to: "${passwordPlain}"`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
};

resetUser();
