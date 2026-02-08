# SwasthyaSetu - Unified Healthcare Access Platform

> **"Connecting 500+ hospitals across India, enabling citizens to access their digital health records via ABHA ID, book appointments, and receive real-time health alerts."**

SwasthyaSetu is a comprehensive government health portal designed to solve the critical problem of fragmented healthcare data and improve inter-hospital coordination. It provides a unified interface for Patients, Hospital Administrators, and Government Officials.

## 🚀 Key Features

### 🏥 Patient Portal
- **ABHA Integration**: Secure login and record access using Ayushman Bharat Health Account.
- **Unified Dashboard**: View appointments, medical history, and prescriptions from multiple hospitals in one place.
- **Telemedicine**: Book and attend video consultations.
- **Health Alerts**: Real-time notifications about disease outbreaks and air quality in your area.

### 🏢 Hospital Network
- **Resource Tracking**: Real-time visibility of beds, oxygen, ventilators, and ambulances.
- **Inter-Hospital Coordination**: Streamlined patient transfer requests.
- **Directory**: Searchable list of 500+ government and private hospitals.

### 🏛️ Government Dashboard
- **National Monitoring**: Real-time overview of health infrastructure and disease outbreaks.
- **Compliance Tracking**: Monitor hospital connectivity and data standards adherence.
- **Outbreak Management**: Heatmaps and alert systems for rapid response.

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript, Tailwind CSS (No framework lock-in for maximum performance)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Security**: JWT Authentication, Role-Based Access Control (RBAC)

## 📂 Documentation

- [**Government Portal Documentation**](docs/GOVERNMENT_PORTAL.md) - Detailed guide for the government dashboard and analytics.
- [**Deployment Guide**](docs/DEPLOYMENT.md) - Instructions for deploying to Render and Vercel.
- [**Database Structure**](docs/DATABASE.md) - Schema details for Users, Appointments, and Hospitals.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB Connection String

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/SwasthyaSetu.git
   cd SwasthyaSetu
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   # Create .env file with MONGODB_URI, JWT_SECRET, PORT=5000
   npm run seed  # Seeds the database with mock data
   npm start
   ```

3. **Run Frontend**
   ```bash
   # Open a new terminal in project root
   npx http-server -p 3000
   ```

4. **Access the App**
   Open `http://localhost:3000` in your browser.

## 🔐 Demo Credentials

| Role | Username / ID | Password |
|------|--------------|----------|
| **Patient** | `12-3456-7890-1234` | `patient123` |
| **Hospital Admin** | `admin@aiims.gov.in` | `admin123` |
| **Government** | *(Access via Govt Login tab)* | `admin123` |

## 📦 Project Structure

```
SwasthyaSetu/
├── assets/          # Static assets
├── backend/         # Node.js API server
├── components/      # Reusable HTML components
├── css/             # Stylesheets (Vanilla + Tailwind)
├── data/            # Mock data for frontend demo
├── docs/            # Project documentation
├── js/              # Application logic
├── pages/           # HTML pages (Dashboard, Profile, etc.)
└── index.html       # Landing page
```

## 🤝 Contributing
Developed as part of the Government of India's Digital Health Mission. Contributions are welcome!

## 📝 License
ISC License
