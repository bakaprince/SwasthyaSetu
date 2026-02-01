const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

const diagnose = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected.');

        const abhaId = '12-3456-7890-1234';
        const passwordPlain = 'patient123';

        console.log(`\n🔍 Searching for user with ABHA ID: "${abhaId}"...`);

        // Find user and select password
        const user = await User.findOne({ abhaId }).select('+password');

        if (!user) {
            console.error('❌ User NOT found!');

            // List all users to see what's there
            const allUsers = await User.find({}, 'abhaId name mobile');
            console.log('\n📋 Existing Users:');
            allUsers.forEach(u => console.log(`   - ${u.name} (${u.abhaId})`));

        } else {
            console.log(`✅ User found: ${user.name}`);
            console.log(`   ID: ${user._id}`);
            console.log(`   Stored Password Hash: ${user.password ? user.password.substring(0, 10) + '...' : 'MISSING'}`);

            console.log(`\n🔑 Testing password comparison for "${passwordPlain}"...`);
            const isMatch = await bcrypt.compare(passwordPlain, user.password);

            if (isMatch) {
                console.log('✅ Password MATCHES!');
            } else {
                console.error('❌ Password DOES NOT MATCH.');

                // Debug: Hash the plain password to see what it should look like
                const newHash = await bcrypt.hash(passwordPlain, 10);
                console.log(`   Test Hash of "${passwordPlain}": ${newHash.substring(0, 10)}...`);
            }
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
};

diagnose();
