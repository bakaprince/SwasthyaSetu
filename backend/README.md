# SwasthyaSetu Backend API

Backend server for SwasthyaSetu - Government Health Portal built with Node.js, Express, and MongoDB.

## Features

- 🔐 **JWT Authentication** - Secure user authentication with role-based access control
- 👥 **User Management** - Patient, Doctor, and Hospital Admin roles
- 📅 **Appointment System** - Patients create requests, hospitals manage them
- 🏥 **Hospital Management** - Hospital listings with resource tracking
- 📋 **Medical Records** - Secure patient medical history
- 🚨 **Health Alerts** - Real-time health notifications
- 🔒 **Security** - Password hashing, JWT tokens, role-based authorization

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   - Copy `.env.example` to `.env`
   - Update MongoDB connection string and JWT secret

3. **Seed the database** (optional):
   ```bash
   npm run seed
   ```

4. **Start the server**:
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `GET /api/auth/verify` - Verify JWT token (protected)

### Appointments
- `GET /api/appointments` - Get user appointments (patient)
- `POST /api/appointments` - Create appointment request (patient)
- `DELETE /api/appointments/:id` - Cancel appointment
- `GET /api/appointments/hospital` - Get hospital appointments (admin)
- `PUT /api/appointments/:id` - Update appointment status (admin)

### Hospitals
- `GET /api/hospitals` - Get all hospitals
- `GET /api/hospitals/:id` - Get hospital details
- `GET /api/hospitals/nearby/:lat/:lng` - Get nearby hospitals

### Profile
- `GET /api/profile` - Get user profile (protected)
- `PUT /api/profile` - Update profile (protected)
- `GET /api/profile/records` - Get medical records (protected)

### Health
- `GET /api/health/alerts` - Get active health alerts
- `GET /api/health/aqi` - Get air quality data

## Appointment Workflow

1. **Patient** creates an appointment request with status `pending`
2. **Hospital Admin** views all pending requests for their hospital
3. **Hospital Admin** can:
   - Confirm appointment (status → `confirmed`)
   - Reject appointment (status → `rejected`)
   - Add notes to the appointment
4. **Patient** can view their appointment status
5. After appointment, status changes to `completed`

## Demo Credentials

### Hospital Admin (AIIMS Delhi)
- **ABHA ID**: `99-9999-9999-9999`
- **Password**: `admin123`

### Patient (Create via registration)
Use the `/api/auth/register` endpoint to create a patient account.

## Database Schema

### User
- ABHA ID, name, mobile, email, password
- Role: patient, doctor, admin
- Location, emergency contact

### Appointment
- Patient, hospital, doctor, specialty
- Date, time, type (In-person/Telemedicine)
- Status: pending, confirmed, completed, cancelled, rejected
- Notes from hospital admin

### Hospital
- Name, city, type, address
- Beds availability (total, available, ICU)
- Resources (oxygen, ventilators, blood bank)
- Departments and doctors

### Medical Record
- Patient, date, hospital, doctor
- Diagnosis, prescriptions, documents

### Health Alert
- Title, severity, type
- Description, symptoms, prevention
- Affected areas, risk level

## Environment Variables

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Role-based access control
- ✅ Protected routes middleware
- ✅ Input validation
- ✅ Error handling middleware
- ✅ CORS configuration

## Development

```bash
# Install dependencies
npm install

# Run in development mode with auto-reload
npm run dev

# Seed database with sample data
npm run seed
```

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Update `FRONTEND_URL` to your production frontend URL
3. Ensure MongoDB Atlas is properly configured
4. Run `npm start`

## API Testing

Use tools like Postman or curl to test the API:

```bash
# Health check
curl http://localhost:5000/api/health-check

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"abhaId":"12-3456-7890-1234","name":"Test User","mobile":"9876543210","password":"test123","dateOfBirth":"1990-01-01","gender":"Male"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"abhaId":"12-3456-7890-1234","password":"test123"}'
```

## License

Government of India - All Rights Reserved
