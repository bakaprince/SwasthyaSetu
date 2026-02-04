const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const PublicHealthLog = require('../models/PublicHealthLog');

// Try loading env from multiple possible locations
dotenv.config(); // Current dir
dotenv.config({ path: path.join(__dirname, '../.env') }); // Backend root
dotenv.config({ path: path.join(__dirname, '../../.env') }); // Project root

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/swasthya_setu';

const cities = [
    { name: 'New Delhi', state: 'Delhi', lat: 28.6139, lng: 77.2090 },
    { name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777 },
    { name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
    { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 },
    { name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639 },
    { name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867 },
    { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
    { name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714 },
    { name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873 },
    { name: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462 },
    { name: 'Patna', state: 'Bihar', lat: 25.5941, lng: 85.1376 },
    { name: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lng: 77.4126 }
];

const diseases = ['COVID-19', 'Dengue', 'Malaria', 'Tuberculosis', 'Influenza'];

const generateLogs = async () => {
    try {
        console.log(`Connecting to MongoDB: ${MONGO_URI.split('@').pop() || 'Localhost/Cluster'}`);
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB');

        await PublicHealthLog.deleteMany({});
        console.log('Cleared existing logs');

        const logs = [];

        // Create 2000 records
        for (let i = 0; i < 2000; i++) {
            // Pick random city
            const city = cities[Math.floor(Math.random() * cities.length)];

            // Bias diseases based on city for "Outbreak" simulation
            let disease = diseases[Math.floor(Math.random() * diseases.length)];

            if (city.name === 'Mumbai' && Math.random() > 0.4) disease = 'COVID-19';
            if (city.name === 'New Delhi' && Math.random() > 0.5) disease = 'Dengue';
            if (city.name === 'Kolkata' && Math.random() > 0.6) disease = 'Malaria';

            // Jitter location slightly to create "Heatmap" cluster effect
            const latJitter = (Math.random() - 0.5) * 0.05;
            const lngJitter = (Math.random() - 0.5) * 0.05;

            // Date in last 30 days
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 30));

            // Status outcome
            let status = 'active';
            const statusRoll = Math.random();
            if (statusRoll > 0.7) status = 'recovered';
            if (statusRoll > 0.95) status = 'deceased';

            logs.push({
                disease,
                location: {
                    state: city.state,
                    city: city.name,
                    lat: city.lat + latJitter,
                    lng: city.lng + lngJitter
                },
                status,
                dateReported: date
            });
        }

        await PublicHealthLog.insertMany(logs);
        console.log(`✅ Seeded ${logs.length} health logs successfully!`);
        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
};

generateLogs();
