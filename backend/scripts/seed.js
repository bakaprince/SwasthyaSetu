const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Hospital = require('../models/Hospital');
const Appointment = require('../models/Appointment');
const HealthAlert = require('../models/HealthAlert');
const connectDB = require('../config/database');

/**
 * Comprehensive seed script for SwasthyaSetu
 * Populates MongoDB with realistic sample data
 */

const seedData = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        console.log('\n🗑️  Clearing existing data...');
        await User.deleteMany({});
        await Hospital.deleteMany({});
        await Appointment.deleteMany({});
        await HealthAlert.deleteMany({});

        // ============ HOSPITALS ============
        console.log('\n🏥 Creating hospitals...');

        const hospitals = await Hospital.insertMany([
            {
                name: 'AIIMS New Delhi',
                city: 'Delhi',
                state: 'Delhi',
                type: 'Government',
                address: 'Ansari Nagar, New Delhi, Delhi 110029',
                location: {
                    type: 'Point',
                    coordinates: [77.2100, 28.5672] // [longitude, latitude]
                },
                contact: {
                    phone: '011-26588500',
                    email: 'info@aiims.edu',
                    emergency: '108'
                },
                beds: {
                    total: 2500,
                    available: 450,
                    icu: 200,
                    icuAvailable: 35
                },
                resources: {
                    oxygen: true,
                    ventilators: true,
                    bloodBank: true
                },
                departments: ['Cardiology', 'Neurology', 'Orthopedics', 'General Medicine', 'Pediatrics'],
                doctors: [
                    { name: 'Dr. Rajesh Sharma', specialty: 'Cardiology', experience: 15 },
                    { name: 'Dr. Priya Verma', specialty: 'Neurology', experience: 12 },
                    { name: 'Dr. Amit Patel', specialty: 'Orthopedics', experience: 10 }
                ]
            },
            {
                name: 'Apollo Hospital Delhi',
                city: 'Delhi',
                state: 'Delhi',
                type: 'Private',
                address: 'Sarita Vihar, New Delhi, Delhi 110076',
                location: {
                    type: 'Point',
                    coordinates: [77.2843, 28.5413]
                },
                contact: {
                    phone: '011-26825000',
                    email: 'info@apollohospitals.com',
                    emergency: '108'
                },
                beds: {
                    total: 700,
                    available: 120,
                    icu: 80,
                    icuAvailable: 15
                },
                resources: {
                    oxygen: true,
                    ventilators: true,
                    bloodBank: true
                },
                departments: ['Cardiology', 'Oncology', 'Neurology', 'General Medicine', 'Gynecology'],
                doctors: [
                    { name: 'Dr. Sunita Gupta', specialty: 'Cardiology', experience: 18 },
                    { name: 'Dr. Vikram Singh', specialty: 'Oncology', experience: 20 }
                ]
            },
            {
                name: 'Tata Memorial Hospital',
                city: 'Mumbai',
                state: 'Maharashtra',
                type: 'Government',
                address: 'Dr Ernest Borges Marg, Parel, Mumbai 400012',
                location: {
                    type: 'Point',
                    coordinates: [72.8447, 19.0142]
                },
                contact: {
                    phone: '022-24177000',
                    email: 'info@tmc.gov.in',
                    emergency: '108'
                },
                beds: {
                    total: 629,
                    available: 85,
                    icu: 50,
                    icuAvailable: 8
                },
                resources: {
                    oxygen: true,
                    ventilators: true,
                    bloodBank: true
                },
                departments: ['Oncology', 'Radiation Oncology', 'Surgical Oncology'],
                doctors: [
                    { name: 'Dr. Ramesh Nair', specialty: 'Oncology', experience: 22 }
                ]
            },
            {
                name: 'Fortis Hospital Bangalore',
                city: 'Bangalore',
                state: 'Karnataka',
                type: 'Private',
                address: 'Bannerghatta Road, Bangalore 560076',
                location: {
                    type: 'Point',
                    coordinates: [77.5986, 12.8953]
                },
                contact: {
                    phone: '080-66214444',
                    email: 'info@fortishealthcare.com',
                    emergency: '108'
                },
                beds: {
                    total: 400,
                    available: 75,
                    icu: 60,
                    icuAvailable: 12
                },
                resources: {
                    oxygen: true,
                    ventilators: true,
                    bloodBank: true
                },
                departments: ['Cardiology', 'Neurology', 'Orthopedics', 'General Medicine'],
                doctors: [
                    { name: 'Dr. Kavita Rao', specialty: 'Cardiology', experience: 14 }
                ]
            },
            {
                name: 'CMC Vellore',
                city: 'Vellore',
                state: 'Tamil Nadu',
                type: 'Trust',
                address: 'Ida Scudder Road, Vellore 632004',
                location: {
                    type: 'Point',
                    coordinates: [79.1352, 12.9246]
                },
                contact: {
                    phone: '0416-2281000',
                    email: 'info@cmcvellore.ac.in',
                    emergency: '108'
                },
                beds: {
                    total: 2938,
                    available: 520,
                    icu: 150,
                    icuAvailable: 28
                },
                resources: {
                    oxygen: true,
                    ventilators: true,
                    bloodBank: true
                },
                departments: ['Cardiology', 'Neurology', 'Orthopedics', 'General Medicine', 'Pediatrics'],
                doctors: [
                    { name: 'Dr. Thomas Jacob', specialty: 'Cardiology', experience: 25 }
                ]
            }
        ]);

        console.log(`✅ Created ${hospitals.length} hospitals`);

        // ============ USERS ============
        console.log('\n👥 Creating users...');

        const hashedPassword = await bcrypt.hash('patient123', 10);
        const hashedAdminPassword = await bcrypt.hash('admin123', 10);

        const users = await User.insertMany([
            // Patients
            {
                abhaId: '12-3456-7890-1234',
                name: 'Rahul Kumar',
                mobile: '9876543210',
                email: 'rahul.kumar@example.com',
                password: hashedPassword,
                role: 'patient',
                dateOfBirth: new Date('1990-05-15'),
                gender: 'Male',
                address: 'Sector 15, Noida, UP',
                emergencyContact: {
                    name: 'Priya Kumar',
                    relation: 'Wife',
                    mobile: '9876543211'
                }
            },
            {
                abhaId: '98-7654-3210-9876',
                name: 'Priya Sharma',
                mobile: '9123456789',
                email: 'priya.sharma@example.com',
                password: hashedPassword,
                role: 'patient',
                dateOfBirth: new Date('1995-08-22'),
                gender: 'Female',
                address: 'Koramangala, Bangalore',
                emergencyContact: {
                    name: 'Raj Sharma',
                    relation: 'Father',
                    mobile: '9123456788'
                }
            },
            {
                abhaId: '45-6789-0123-4567',
                name: 'Amit Patel',
                mobile: '9988776655',
                email: 'amit.patel@example.com',
                password: hashedPassword,
                role: 'patient',
                dateOfBirth: new Date('1988-03-10'),
                gender: 'Male',
                address: 'Andheri West, Mumbai'
            },
            {
                abhaId: '11-2233-4455-6677',
                name: 'Sneha Reddy',
                mobile: '9876512345',
                email: 'sneha.reddy@example.com',
                password: hashedPassword,
                role: 'patient',
                dateOfBirth: new Date('1992-11-30'),
                gender: 'Female',
                address: 'Banjara Hills, Hyderabad'
            },
            {
                abhaId: '22-3344-5566-7788',
                name: 'Vikram Singh',
                mobile: '9123498765',
                email: 'vikram.singh@example.com',
                password: hashedPassword,
                role: 'patient',
                dateOfBirth: new Date('1985-07-18'),
                gender: 'Male',
                address: 'Salt Lake, Kolkata'
            },

            // Hospital Admins
            {
                abhaId: '99-9999-9999-9999',
                name: 'Dr. Admin AIIMS',
                mobile: '9999999999',
                email: 'admin@aiims.edu',
                password: hashedAdminPassword,
                role: 'admin',
                dateOfBirth: new Date('1980-01-01'),
                gender: 'Male',
                hospitalId: hospitals[0]._id // AIIMS Delhi
            },
            {
                abhaId: '88-8888-8888-8888',
                name: 'Dr. Admin Apollo',
                mobile: '8888888888',
                email: 'admin@apollo.com',
                password: hashedAdminPassword,
                role: 'admin',
                dateOfBirth: new Date('1982-02-02'),
                gender: 'Female',
                hospitalId: hospitals[1]._id // Apollo Delhi
            }
        ]);

        console.log(`✅ Created ${users.length} users (${users.filter(u => u.role === 'patient').length} patients, ${users.filter(u => u.role === 'admin').length} admins)`);

        // ============ APPOINTMENTS ============
        console.log('\n📅 Creating appointments...');

        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);

        const appointments = await Appointment.insertMany([
            // Upcoming appointments
            {
                patientId: users[0]._id,
                hospitalId: hospitals[0]._id,
                hospital: hospitals[0].name,
                doctor: 'Dr. Rajesh Sharma',
                specialty: 'Cardiology',
                date: tomorrow.toISOString().split('T')[0],
                time: '10:00 AM',
                type: 'In-person',
                reason: 'Regular checkup for heart condition',
                status: 'confirmed'
            },
            {
                patientId: users[1]._id,
                hospitalId: hospitals[3]._id,
                hospital: hospitals[3].name,
                doctor: 'Dr. Kavita Rao',
                specialty: 'Cardiology',
                date: nextWeek.toISOString().split('T')[0],
                time: '02:00 PM',
                type: 'Telemedicine',
                reason: 'Follow-up consultation',
                status: 'confirmed'
            },
            {
                patientId: users[2]._id,
                hospitalId: hospitals[1]._id,
                hospital: hospitals[1].name,
                doctor: 'Dr. Sunita Gupta',
                specialty: 'Cardiology',
                date: nextWeek.toISOString().split('T')[0],
                time: '11:00 AM',
                type: 'In-person',
                reason: 'Chest pain evaluation',
                status: 'pending'
            },
            {
                patientId: users[3]._id,
                hospitalId: hospitals[0]._id,
                hospital: hospitals[0].name,
                doctor: 'Dr. Amit Patel',
                specialty: 'Orthopedics',
                date: tomorrow.toISOString().split('T')[0],
                time: '03:00 PM',
                type: 'In-person',
                reason: 'Knee pain consultation',
                status: 'confirmed'
            },

            // Past appointments
            {
                patientId: users[0]._id,
                hospitalId: hospitals[0]._id,
                hospital: hospitals[0].name,
                doctor: 'Dr. Priya Verma',
                specialty: 'Neurology',
                date: lastWeek.toISOString().split('T')[0],
                time: '09:00 AM',
                type: 'In-person',
                reason: 'Headache consultation',
                status: 'completed'
            },
            {
                patientId: users[4]._id,
                hospitalId: hospitals[2]._id,
                hospital: hospitals[2].name,
                doctor: 'Dr. Ramesh Nair',
                specialty: 'Oncology',
                date: lastWeek.toISOString().split('T')[0],
                time: '01:00 PM',
                type: 'In-person',
                reason: 'Cancer screening',
                status: 'completed'
            }
        ]);

        console.log(`✅ Created ${appointments.length} appointments`);

        // ============ HEALTH ALERTS ============
        console.log('\n🚨 Creating health alerts...');

        const healthAlerts = await HealthAlert.insertMany([
            {
                title: 'Dengue Prevention Protocol',
                severity: 'high',
                type: 'disease',
                description: 'Dengue cases are rising in Delhi NCR region. Take preventive measures.',
                symptoms: ['High Fever', 'Severe Headache', 'Pain Behind Eyes', 'Joint and Muscle Pain', 'Nausea'],
                prevention: [
                    'Remove stagnant water from surroundings',
                    'Use mosquito repellents',
                    'Wear full-sleeve clothes',
                    'Use mosquito nets while sleeping'
                ],
                affectedAreas: ['Delhi', 'Noida', 'Gurgaon', 'Faridabad'],
                riskLevel: 85,
                isActive: true,
                source: 'National Vector Borne Disease Control Programme'
            },
            {
                title: 'Seasonal Flu Alert',
                severity: 'moderate',
                type: 'disease',
                description: 'H3N2 influenza cases increasing across major cities.',
                symptoms: ['Fever', 'Cough', 'Sore Throat', 'Body Ache'],
                prevention: [
                    'Get flu vaccination',
                    'Wash hands frequently',
                    'Avoid crowded places',
                    'Wear masks in public'
                ],
                affectedAreas: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai'],
                riskLevel: 65,
                isActive: true,
                source: 'Indian Council of Medical Research'
            },
            {
                title: 'Air Quality Alert - Delhi NCR',
                severity: 'high',
                type: 'environmental',
                description: 'Air Quality Index (AQI) has reached hazardous levels.',
                symptoms: ['Breathing Difficulty', 'Eye Irritation', 'Cough'],
                prevention: [
                    'Stay indoors as much as possible',
                    'Use N95 masks when going out',
                    'Use air purifiers at home',
                    'Avoid outdoor exercise'
                ],
                affectedAreas: ['Delhi', 'Noida', 'Ghaziabad', 'Gurgaon'],
                riskLevel: 90,
                isActive: true,
                source: 'Central Pollution Control Board'
            },
            {
                title: 'Malaria Prevention - Monsoon Season',
                severity: 'moderate',
                type: 'disease',
                description: 'Increased malaria cases reported during monsoon.',
                symptoms: ['High Fever', 'Chills', 'Sweating', 'Headache', 'Vomiting'],
                prevention: [
                    'Use mosquito nets',
                    'Apply mosquito repellent creams',
                    'Keep surroundings clean and dry',
                    'Seek immediate medical attention for fever'
                ],
                affectedAreas: ['Mumbai', 'Kolkata', 'Chennai', 'Hyderabad'],
                riskLevel: 70,
                isActive: true,
                source: 'National Vector Borne Disease Control Programme'
            },
            {
                title: 'COVID-19 Booster Dose Reminder',
                severity: 'low',
                type: 'vaccination',
                description: 'Booster doses available for eligible population.',
                prevention: [
                    'Check eligibility on CoWIN portal',
                    'Book appointment for booster dose',
                    'Carry ID proof and vaccination certificate'
                ],
                affectedAreas: ['All India'],
                riskLevel: 40,
                isActive: true,
                source: 'Ministry of Health and Family Welfare'
            }
        ]);

        console.log(`✅ Created ${healthAlerts.length} health alerts`);

        // ============ SUMMARY ============
        console.log('\n' + '='.repeat(50));
        console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
        console.log('='.repeat(50));
        console.log('\n📊 Summary:');
        console.log(`   🏥 Hospitals: ${hospitals.length}`);
        console.log(`   👥 Users: ${users.length} (${users.filter(u => u.role === 'patient').length} patients, ${users.filter(u => u.role === 'admin').length} admins)`);
        console.log(`   📅 Appointments: ${appointments.length}`);
        console.log(`   🚨 Health Alerts: ${healthAlerts.length}`);

        console.log('\n🔑 Demo Credentials:');
        console.log('\n   Patients:');
        console.log('   - ABHA: 12-3456-7890-1234 | Password: patient123 | Name: Rahul Kumar');
        console.log('   - ABHA: 98-7654-3210-9876 | Password: patient123 | Name: Priya Sharma');
        console.log('   - ABHA: 45-6789-0123-4567 | Password: patient123 | Name: Amit Patel');

        console.log('\n   Hospital Admins:');
        console.log('   - ABHA: 99-9999-9999-9999 | Password: admin123 | Hospital: AIIMS Delhi');
        console.log('   - ABHA: 88-8888-8888-8888 | Password: admin123 | Hospital: Apollo Delhi');

        console.log('\n✨ You can now start the server and login with these credentials!\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error seeding database:', error);
        process.exit(1);
    }
};

// Run seed
seedData();
