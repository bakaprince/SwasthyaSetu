const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas
 */
const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI environment variable is required');
        }

        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000
        });

        console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);

        mongoose.connection.on('error', (err) => {
            console.error(`❌ MongoDB error: ${err}`);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB disconnected');
        });

    } catch (error) {
        console.error(`❌ MongoDB Atlas Connection Error: ${error.message}`);
        console.error('Please check your Atlas configuration');
        process.exit(1);
    }
};

module.exports = connectDB;
