# System Architecture: SwasthyaSetu

## 1. High-Level Overview

SwasthyaSetu is a unified digital health platform serving three primary user groups: **Patients**, **Hospitals**, and the **Government**. It facilitates seamless healthcare services, including appointment booking, health record management, resource tracking, and real-time public health monitoring.

The system follows a standard **Client-Server Architecture**:
- **Frontend**: A responsive Single Page Application (SPA)-like experience built with Vanilla HTML/JS, utilizing a component-based structure.
- **Backend**: A RESTful API built with Node.js and Express.js.
- **Database**: MongoDB (Atlas) for persistent data storage.
- **Infrastructure**: Deployment support for Vercel (serverless/edge) and standard Node.js environments.

---

## 2. Technical Stack

### Frontend
- **Core**: HTML5, CSS3, JavaScript (ES6+).
- **Styling**: Tailwind CSS (CDN-based) + Custom CSS.
- **Component System**: Custom vanilla JS component architecture (located in `js/components/`).
- **State/Service Layer**: Dedicated service modules (located in `js/services/`) for API communication and business logic.
- **Visualizations**:
    - `Leaflet.js` & Custom SVG for Maps.
    - `Chart.js` for Analytics/Health Trends.
- **Routing**: Client-side navigation logic handled via `navigation.js`.

### Backend
- **Runtime**: Node.js.
- **Framework**: Express.js.
- **Database ODM**: Mongoose.
- **Authentication**: JWT (JSON Web Tokens) with `bcryptjs` for password hashing.
- **Security**: `helmet`, `cors`, `rate-limit`.
- **Optimization**: `compression` middleware.

### Database (MongoDB)
- **User**: Stores patient, doctor, and admin profiles (ABHA ID, role, demographics).
- **Hospital**: Stores hospital details and resource availability (beds, oxygen).
- **Appointment**: Links users and hospitals for scheduling.
- **HealthAlert / PublicHealthLog**: Stores disease outbreak info and AQI data.

---

## 3. Data Flow Architecture

```mermaid
graph TD
    User[End User] -->|HTTPS| CDN[Vercel Edge / Static Assets]
    User -->|API Calls (fetch)| API[Express API Gateway]

    subgraph Frontend [Client Browser]
        UI[HTML Pages] --> Components[JS Components]
        Components --> Services[Service Layer (api.js)]
    end

    subgraph Backend [Node.js Server]
        API --> Auth[Auth Middleware (JWT)]
        API --> Controllers[Route Controllers]
        Controllers --> Models[Mongoose Models]
    end

    subgraph Database [MongoDB Atlas]
        Models --> DB[(Primary DB)]
    end

    Services -->|JSON| API
```

---

## 4. Key Architectural Components

### 4.1 Authentication & Security
- **JWT-Based**: Stateless authentication using JSON Web Tokens.
- **Flow**:
    1. User logs in via `auth/login`.
    2. Server validates credentials and returns a JWT.
    3. Frontend stores JWT (localStorage/memory).
    4. Subsequent requests include `Authorization: Bearer <token>` header.
- **Role-Based Access Control (RBAC)**: Users have roles (`patient`, `doctor`, `admin`) enforcing permission checks on specific routes.

### 4.2 Frontend Architecture
The frontend is structured to be modular despite using Vanilla JS.
- **`js/services/`**: Encapsulates all external API calls.
    - `api.js`: Base HTTP client with automatic base URL detection (localhost vs prod) and token injection.
    - `auth.js`, `appointment.js`, `aqi.js`: Feature-specific service methods.
- **`js/components/`**: UI Logic.
    - `navigation.js`: Manages global navigation state.
    - `booking-wizard.js`: Complex multi-step form logic for appointments.
    - `india-map.js`: Interactive map logic.

### 4.3 Backend API Structure
RESTful endpoints organized by resource:
- `/api/auth`: Registration, Login, Profile verification.
- `/api/appointments`: CRUD operations for appointments.
- `/api/hospitals`: Public and protected hospital data access.
- `/api/profile`: User profile management.
- `/api/health`: Health alerts and AQI data.
- `/api/analytics`: Aggregated data for government dashboards.

### 4.4 Deployment & Environment
- **Configuration**: Uses `.env` for secrets (DB URI, JWT Secret).
- **Vercel Integration**:
    - `vercel.json` configures the build and rewrites.
    - `server.js` exports the app module for Vercel's serverless function execution model.
    - Also supports standard `node server.js` for long-running server environments.

---

## 5. Future Scalability Considerations
- **Microservices**: The current modular route structure allows for easy splitting into microservices if needed (e.g., separating the Analytics service).
- **Caching**: Redis could be implemented for caching API responses, especially for `hospitals` and `analytics` endpoints.
- **Real-time**: Socket.io could be added for live doctor-patient chat or real-time bed availability updates.
