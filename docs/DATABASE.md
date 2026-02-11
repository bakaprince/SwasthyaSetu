# 🗄 SwasthyaSetu – MongoDB Database Architecture

## 📌 Overview

SwasthyaSetu uses a MongoDB document-based architecture designed for:

- Role-based user management
- Efficient appointment lifecycle tracking
- Hospital resource monitoring
- Secure medical record storage
- Real-time public health alerts

The system consists of **5 Core Collections**:

1. `users`
2. `appointments`
3. `hospitals`
4. `medicalrecords`
5. `healthalerts`

All relationships are maintained using ObjectId references where required.

---

# 1️⃣ Users Collection (`users`)

### 🎯 Purpose
Stores authentication credentials and profile data for:

- Patients
- Doctors
- Admin staff

### 🔐 Key Indexes
- `{ abhaId: 1 }` → Unique
- `{ mobile: 1 }` → Unique

---

## Schema Structure

| Field | Type | Required | Description |
|-------|------|----------|------------|
| `_id` | ObjectId | Yes | MongoDB unique identifier |
| `abhaId` | String | Yes | National Health ID (Unique) |
| `name` | String | Yes | Full name |
| `mobile` | String | Yes | Unique mobile number |
| `email` | String | No | Optional email |
| `password` | String | Yes | Hashed using bcrypt |
| `dateOfBirth` | Date | Yes | Used to calculate age |
| `age` | Number | No | Auto-calculated |
| `gender` | String | Yes | `Male`, `Female`, `Other` |
| `bloodGroup` | String | No | Enum: A+, B+, O+, etc. |
| `role` | String | No | `patient` (default), `doctor`, `admin` |
| `hospitalId` | ObjectId | No | Ref → `hospitals` (for staff) |
| `location` | Object | No | `{ latitude, longitude, city, state }` |
| `emergencyContact` | Object | No | `{ name, relation, mobile }` |

---

# 2️⃣ Appointments Collection (`appointments`)

### 🎯 Purpose
Handles complete booking lifecycle between patients and hospitals.

### ⚡ Optimized For
- User appointment history
- Hospital dashboard filtering
- Status tracking

### 🔍 Key Indexes
- `{ userId: 1, date: -1 }`
- `{ hospitalId: 1, status: 1 }`

---

## Schema Structure

| Field | Type | Required | Description |
|-------|------|----------|------------|
| `_id` | ObjectId | Yes | Appointment ID |
| `userId` | ObjectId | Yes | Ref → `users` (Patient) |
| `hospitalId` | ObjectId / String | Yes | Ref → `hospitals` (Internal or External ID) |
| `hospital` | String | Yes | Hospital name snapshot |
| `hospitalAddress` | String | No | Address snapshot |
| `doctor` | String | Yes | Doctor name |
| `specialty` | String | Yes | Department |
| `date` | Date | Yes | Appointment date |
| `time` | String | Yes | Time slot |
| `type` | String | Yes | `In-person`, `Telemedicine` |
| `status` | String | No | `pending`, `confirmed`, `completed`, `cancelled` |
| `reason` | String | Yes | Reason for visit |
| `notes` | String | No | Admin internal notes |
| `confirmedBy` | ObjectId | No | Ref → `users` (Admin) |

---

# 3️⃣ Hospitals Collection (`hospitals`)

### 🎯 Purpose
Internal directory for hospitals managed within the system.

Supports:

- Resource tracking
- Department listings
- Location-based filtering

### 📍 Geospatial Index
- `{ location.latitude: 1, location.longitude: 1 }`

---

## Schema Structure

| Field | Type | Required | Description |
|-------|------|----------|------------|
| `_id` | ObjectId | Yes | Hospital ID |
| `name` | String | Yes | Hospital name |
| `city` | String | Yes | City |
| `type` | String | Yes | `Government`, `Private`, `Trust` |
| `address` | String | Yes | Full address |
| `contact` | Object | Yes | `{ phone, email, emergency }` |
| `beds` | Object | No | `{ total, available, icu, icuAvailable }` |
| `resources` | Object | No | `{ oxygen, ventilators, bloodBank }` |
| `location` | Object | No | `{ latitude, longitude }` |
| `rating` | Number | No | 0–5 rating |
| `departments` | Array | No | List of department objects |

---

# 4️⃣ Medical Records Collection (`medicalrecords`)

### 🎯 Purpose
Stores structured patient medical history.

Optimized for chronological retrieval.

### 🔍 Key Index
- `{ userId: 1, date: -1 }`

---

## Schema Structure

| Field | Type | Required | Description |
|-------|------|----------|------------|
| `_id` | ObjectId | Yes | Record ID |
| `userId` | ObjectId | Yes | Ref → `users` |
| `date` | Date | Yes | Record date |
| `hospital` | String | Yes | Hospital name |
| `doctor` | String | Yes | Doctor name |
| `diagnosis` | String | Yes | Primary diagnosis |
| `prescriptions` | Array | No | List of medicines |
| `documents` | Array | No | URLs to uploaded reports |
| `notes` | String | No | Additional notes |

---

# 5️⃣ Health Alerts Collection (`healthalerts`)

### 🎯 Purpose
Broadcast system for public health notifications.

Used for:

- Disease outbreaks
- Weather alerts
- Pollution warnings

### 🔍 Key Index
- `{ isActive: 1, severity: -1 }`

---

## Schema Structure

| Field | Type | Required | Description |
|-------|------|----------|------------|
| `_id` | ObjectId | Yes | Alert ID |
| `title` | String | Yes | Alert headline |
| `severity` | String | Yes | `high`, `moderate`, `low` |
| `type` | String | Yes | `disease`, `weather`, `pollution` |
| `isActive` | Boolean | No | Default: true |
| `description` | String | Yes | Detailed information |
| `symptoms` | Array | No | Symptom list |
| `prevention` | Array | No | Prevention steps |
| `affectedAreas` | Array | No | City names |
| `riskLevel` | Number | No | 0–100 scale |

---

# 🔐 Security Considerations

- Passwords hashed using bcrypt
- JWT-based authentication
- Role-based access control
- Sensitive endpoints protected via middleware

---

# 📈 Performance Considerations

- Indexed frequent query fields
- `.lean()` queries for read-only endpoints
- Parallel population of references
- Optimized filtering for dashboard views

---

# 📊 Design Philosophy

The database design prioritizes:

- Read performance for dashboards
- Scalable appointment tracking
- Clear separation of roles
- Minimal duplication of relational data
- Flexible document structure for future extensions
