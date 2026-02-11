# 🏥 SwasthyaSetu – Unified Digital Health Platform

SwasthyaSetu is a full-stack digital health platform designed to connect **patients, hospitals, and government health authorities** in a unified ecosystem.

It enables secure health record access, real-time hospital resource tracking, intelligent appointment management, and analytics-driven public health monitoring.

---
## 🌐 Live Deployment

- Frontend: https://your-frontend.vercel.app
- Backend API: https://swasthyasetu-backend.onrender.com/api/health-check

---

## 🌟 Core Objectives

- Digitize and centralize healthcare workflows
- Improve transparency in hospital resource availability
- Enable data-driven government health monitoring
- Deliver a smooth, optimized, and scalable user experience

---
## 🏗 System Architecture

For detailed technical architecture, data flow diagrams, and scalability considerations:

See: `docs/SYSTEM_ARCHITECTURE.md`

---

## 👥 User Roles & Capabilities

### 🧑‍⚕️ Patients
- Unified health record access
- Online appointment booking
- Medical history tracking
- Health alerts and outbreak notifications
- ABHA (Ayushman Bharat Health Account) integration

---

### 🏥 Hospitals
- Bed, ICU, and oxygen tracking
- Appointment dashboard
- Patient data management
- Trend analytics & disease reporting

---

### 🏛 Government
- National health analytics dashboard
- State-wise outbreak monitoring
- Interactive disease mapping
- COVID data visualization (with intelligent caching)
- Public health log tracking

---

## ⚡ Performance Optimizations (Hackathon Enhancements)

### 🔐 Authentication Optimization
- Reduced bcrypt hashing rounds for demo responsiveness
- Login time reduced from ~15s to ~2–3s
- JWT-based secure session management

### 🚀 Database Improvements
- Parallel `.populate()` queries
- `.lean()` queries for read-only endpoints
- Reduced response latency by 20–30%

### 🔄 Prefetching System
- Post-login background data prefetch
- Dashboard renders instantly
- Parallel API fetching using `Promise.allSettled()`

### 📊 Government Analytics Caching
- COVID data cached in localStorage (6-hour expiry)
- Eliminates repeated external API delay
- Corruption-safe cache handling with try/catch

### 🛡 Stability Hardening
- Defensive JSON parsing
- localStorage quota protection
- Script race-condition prevention
- Partial API failure tolerance

---

## 🛠 Technology Stack

### 🎨 Frontend
- HTML5, CSS3, Vanilla JavaScript (ES6+)
- Tailwind CSS (CDN)
- Leaflet.js (Interactive maps)
- Chart.js (Analytics visualization)
- LocalStorage caching

### ⚙ Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- bcryptjs
- Helmet, CORS, Rate limiting
- Compression middleware

---

## 🏗 Project Architecture

Frontend ├── Prefetch Layer ├── Location Service ├── Dashboard Pages └── Analytics Modules
Backend (Express API)
   ├── Controllers
   ├── Middleware
   ├── Models (Mongoose)
   └── MongoDB Database

---

## 📂 Folder Structure

SwasthyaSetu/
├── assets/              # Static assets
├── backend/             # Express API server
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── middleware/
├── components/          # Reusable HTML components
├── css/                 # Styling
├── data/                # Mock data
├── docs/                # Technical documentation
├── js/                  # Frontend logic & services
│   ├── services/
│   └── pages/
├── index.html
└── README.md
---

## 🔄 Prefetch Strategy

After successful login:

1. Appointments
2. Hospitals
3. Profile data

are fetched in parallel and cached for instant dashboard rendering.

This significantly improves perceived performance and user experience.

---

## 🧪 Demo Flow

1. Login as Patient
2. Observe login speed (<3 seconds)
3. Navigate to Dashboard (instant render via prefetch)
4. Switch to Government role
5. Open analytics dashboard
6. Refresh page (cached data loads instantly)

---

## 🧠 Key Engineering Decisions

- Prioritized perceived performance over heavy architectural refactors
- Implemented safe caching with corruption handling
- Used defensive programming for stability under edge cases
- Maintained clean branch-based Git workflow for safe deployment

---
---

## 👨‍💻 Team

**Team Name:** Dr. Code
**Total Members:** 5

This project was collaboratively developed as part of a hackathon initiative.
Each team member contributed across frontend development, backend APIs, database design, UI/UX optimization, and performance engineering.

---

## 📜 License

ISC License
