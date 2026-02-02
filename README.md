# SwasthyaSetu - Unified Healthcare Access Platform

A comprehensive government health portal providing unified access to medical services, hospital resources, and health records across India.

## 🚀 Features

- **ABHA Integration** - Secure authentication using Ayushman Bharat Health Account
- **Hospital Network** - Search and filter 500+ hospitals across India
- **Real-time Resource Tracking** - Check bed availability, ICU, ventilators, and ambulances
- **Appointment Booking** - Schedule appointments with doctors and specialists
- **Medical Records** - Access and manage your health records securely
- **Health Alerts** - Stay informed about disease outbreaks and air quality
- **Emergency Access** - Quick ambulance booking for emergencies

## 🛠️ Tech Stack

**Frontend:**
- HTML5, CSS3, JavaScript (Vanilla)
- Tailwind CSS for styling
- Material Icons

**Backend:**
- Node.js + Express.js
- MongoDB Atlas (Cloud Database)
- JWT Authentication
- RESTful API

## 📦 Project Structure

```
SwasthyaSetu/
├── index.html              # Landing page
├── pages/                  # Application pages
│   ├── dashboard.html
│   ├── hospitals.html
│   ├── appointments.html
│   ├── profile.html
│   └── ...
├── js/                     # JavaScript modules
│   ├── services/          # API and auth services
│   ├── components/        # Reusable components
│   ├── utils/             # Helper functions
│   └── config/            # Configuration
├── css/                    # Stylesheets
├── assets/                 # Images and media
├── backend/                # Node.js backend
│   ├── server.js
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── config/
└── data/                   # Static data files

```

## 🚀 Quick Start

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/SwasthyaSetu.git
   cd SwasthyaSetu
   ```

2. **Set up backend:**
   ```bash
   cd backend
   npm install
   ```

3. **Create `.env` file in backend folder:**
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   NODE_ENV=development
   ```

4. **Seed the database:**
   ```bash
   npm run seed
   ```

5. **Start backend server:**
   ```bash
   npm start
   ```

6. **Start frontend (in new terminal):**
   ```bash
   # From project root
   python -m http.server 3000
   # OR
   npx http-server -p 3000
   ```

7. **Open browser:**
   ```
   http://localhost:3000
   ```

### Demo Credentials

**Patient Login:**
- ABHA ID: `12-3456-7890-1234`
- Password: `patient123`

**Admin Login:**
- Email: `admin@aiims.gov.in`
- Password: `admin123`

## 🌐 Deployment

### Deploy to Production

The application uses a two-tier deployment architecture:

- **Frontend**: [Vercel](https://swasthya-setu-ebon.vercel.app) (Static hosting)
- **Backend**: [Render](https://swasthyasetu-9y5l.onrender.com) (Node.js API)

See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for detailed backend deployment instructions.

**Live Demo Credentials:**

**Patient Login:**
- ABHA ID: `12-3456-7890-1234`
- Password: `patient123`

**Admin Login:**
- Email: `admin@aiims.gov.in`
- Password: `admin123`

## 📚 API Documentation

### Authentication Endpoints

```
POST /api/auth/login       - User login
POST /api/auth/register    - User registration
POST /api/auth/verify-otp  - OTP verification
```

### Hospital Endpoints

```
GET  /api/hospitals        - Get all hospitals
GET  /api/hospitals/:id    - Get hospital details
GET  /api/hospitals/nearby - Get nearby hospitals
```

### Appointment Endpoints

```
GET  /api/appointments     - Get user appointments
POST /api/appointments     - Create appointment
PUT  /api/appointments/:id - Update appointment
```

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS protection
- Helmet.js security headers
- Environment variable protection

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👥 Team

Developed as part of the Government of India's Digital Health Mission.

## 📧 Contact

For issues and questions, please open an issue on GitHub.

## 🙏 Acknowledgments

- Ministry of Health & Family Welfare, Government of India
- National Health Authority (NHA)
- Ayushman Bharat Digital Mission (ABDM)

---

**Note:** This is a demonstration project. For production use, additional security measures and compliance with healthcare regulations (HIPAA, etc.) are required.
