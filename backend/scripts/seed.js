require('dotenv').config();
const connectDB = require('../config/database');
const Hospital = require('../models/Hospital');
const HealthAlert = require('../models/HealthAlert');
const User = require('../models/User');

const seedData = async () => {
    try {
        // Connect to database
        await connectDB();

        console.log('🌱 Starting database seed...\n');

        // Clear existing data
        await Hospital.deleteMany({});
        await HealthAlert.deleteMany({});
        console.log('✅ Cleared existing data\n');

        // Seed Hospitals
        const hospitals = [
            {
                name: 'AIIMS Delhi',
                city: 'Delhi',
                type: 'Government',
                beds: { total: 2500, available: 450, icu: 200, icuAvailable: 35 },
                resources: { oxygen: true, ventilators: true, bloodBank: true },
                contact: { phone: '011-26588500', email: 'info@aiims.edu', emergency: '108' },
                address: 'Ansari Nagar, New Delhi, Delhi 110029',
                location: { latitude: 28.5672, longitude: 77.2100 },
                rating: 4.5,
                departments: [
                    {
                        name: 'General Medicine',
                        doctors: [
                            { name: 'Dr. Rajesh Sharma', specialty: 'General Medicine', available: true },
                            { name: 'Dr. Priya Gupta', specialty: 'General Medicine', available: true }
                        ]
                    },
                    {
                        name: 'Cardiology',
                        doctors: [
                            { name: 'Dr. Amit Kumar', specialty: 'Cardiology', available: true }
                        ]
                    }
                ]
            },
            {
                name: 'Apollo Hospital Delhi',
                city: 'Delhi',
                type: 'Private',
                beds: { total: 700, available: 120, icu: 80, icuAvailable: 15 },
                resources: { oxygen: true, ventilators: true, bloodBank: true },
                contact: { phone: '011-26825858', email: 'info@apollohospitalsdelhi.com', emergency: '108' },
                address: 'Sarita Vihar, Delhi 110076',
                location: { latitude: 28.5355, longitude: 77.2860 },
                rating: 4.3,
                departments: [
                    {
                        name: 'Cardiology',
                        doctors: [
                            { name: 'Dr. Priya Patel', specialty: 'Cardiology', available: true }
                        ]
                    },
                    {
                        name: 'Orthopedics',
                        doctors: [
                            { name: 'Dr. Amit Verma', specialty: 'Orthopedics', available: true }
                        ]
                    }
                ]
            },
            {
                name: 'Max Super Speciality Hospital',
                city: 'Delhi',
                type: 'Private',
                beds: { total: 500, available: 85, icu: 60, icuAvailable: 12 },
                resources: { oxygen: true, ventilators: true, bloodBank: true },
                contact: { phone: '011-26515050', email: 'info@maxhealthcare.com', emergency: '108' },
                address: 'Saket, New Delhi, Delhi 110017',
                location: { latitude: 28.5244, longitude: 77.2066 },
                rating: 4.4,
                departments: [
                    {
                        name: 'Neurology',
                        doctors: [
                            { name: 'Dr. Vikram Singh', specialty: 'Neurology', available: true }
                        ]
                    }
                ]
            },
            {
                name: 'Safdarjung Hospital',
                city: 'Delhi',
                type: 'Government',
                beds: { total: 1800, available: 320, icu: 150, icuAvailable: 28 },
                resources: { oxygen: true, ventilators: true, bloodBank: true },
                contact: { phone: '011-26165060', email: 'info@safdarjunghospital.in', emergency: '108' },
                address: 'Ansari Nagar West, New Delhi, Delhi 110029',
                location: { latitude: 28.5678, longitude: 77.2044 },
                rating: 4.0
            },
            {
                name: 'Fortis Hospital',
                city: 'Delhi',
                type: 'Private',
                beds: { total: 400, available: 70, icu: 50, icuAvailable: 10 },
                resources: { oxygen: true, ventilators: true, bloodBank: true },
                contact: { phone: '011-47135000', email: 'info@fortishealthcare.com', emergency: '108' },
                address: 'Shalimar Bagh, Delhi 110088',
                location: { latitude: 28.7196, longitude: 77.1564 },
                rating: 4.2
            }
        ];

        await Hospital.insertMany(hospitals);
        console.log(`✅ Seeded ${hospitals.length} hospitals\n`);

        // Seed Health Alerts
        const healthAlerts = [
            {
                title: 'Dengue Prevention Protocol',
                severity: 'high',
                type: 'disease',
                description: 'Mosquito-borne viral infection cases are rising in Delhi NCR region.',
                symptoms: ['High Fever', 'Severe Headache', 'Pain Behind Eyes', 'Joint and Muscle Pain', 'Nausea'],
                prevention: [
                    'Remove stagnant water around your home',
                    'Use mosquito repellents',
                    'Wear protective clothing',
                    'Use mosquito nets while sleeping'
                ],
                affectedAreas: ['Delhi', 'Noida', 'Gurgaon', 'Faridabad'],
                riskLevel: 75,
                isActive: true,
                source: 'National Vector Borne Disease Control Programme'
            },
            {
                title: 'Seasonal Flu Alert',
                severity: 'moderate',
                type: 'disease',
                description: 'Increasing cases of H3N2 influenza reported across North India.',
                symptoms: ['Fever', 'Cough', 'Sore Throat', 'Body Aches', 'Fatigue'],
                prevention: [
                    'Get vaccinated',
                    'Wash hands frequently',
                    'Avoid crowded places',
                    'Wear masks in public'
                ],
                affectedAreas: ['Delhi', 'Punjab', 'Haryana', 'Uttar Pradesh'],
                riskLevel: 60,
                isActive: true,
                source: 'Ministry of Health & Family Welfare'
            },
            {
                title: 'Air Quality Warning',
                severity: 'high',
                type: 'pollution',
                description: 'Poor air quality levels detected. Sensitive groups should take precautions.',
                symptoms: ['Breathing Difficulty', 'Eye Irritation', 'Cough'],
                prevention: [
                    'Limit outdoor activities',
                    'Use air purifiers indoors',
                    'Wear N95 masks outdoors',
                    'Keep windows closed'
                ],
                affectedAreas: ['Delhi', 'Noida', 'Ghaziabad'],
                riskLevel: 85,
                isActive: true,
                source: 'Central Pollution Control Board'
            }
        ];

        await HealthAlert.insertMany(healthAlerts);
        console.log(`✅ Seeded ${healthAlerts.length} health alerts\n`);

        // Create a demo admin user for hospital
        const adminUser = await User.create({
            abhaId: '99-9999-9999-9999',
            name: 'Hospital Admin',
            mobile: '9999999999',
            email: 'admin@aiims.edu',
            password: 'admin123',
            dateOfBirth: '1980-01-01',
            gender: 'Male',
            role: 'admin',
            hospitalId: hospitals[0]._id // AIIMS Delhi
        });

        console.log('✅ Created demo admin user');
        console.log(`   ABHA ID: ${adminUser.abhaId}`);
        console.log(`   Password: admin123\n`);

        console.log('🎉 Database seeded successfully!\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedData();
