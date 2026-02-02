const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const connectDB = require('./config/database');

const check = async () => {
    try {
        await connectDB();
        const user = await User.findOne({ abhaId: '12-3456-7890-1234' });
        console.log(user ? 'User found' : 'User NOT found');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

check();
