# MongoDB Database Structure - SwasthyaSetu

## Overview
The database consists of **5 Core Collections**:
1.  **Users** (`users`): Authentication and profiles for Patients, Doctors, and Admins.
2.  **Appointments** (`appointments`): Booking data and status tracking.
3.  **Hospitals** (`hospitals`): Internal directory of managed hospitals.
4.  **MedicalRecords** (`medicalrecords`): Patient health history and reports.
5.  **HealthAlerts** (`healthalerts`): Public announcements and warnings.

---

## 1. Users Collection (`users`)
**Purpose:** Stores specific profile data based on the user's role.
**Key Indexes:** `abhaId` (Unique), `mobile` (Unique)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Yes | Unique Database ID |
| `abhaId` | String | **Yes** | Unique ABHA Number (National Health ID) |
| `name` | String | **Yes** | Full Name |
| `mobile` | String | **Yes** | Unique Mobile Number |
| `email` | String | No | Optional Email Address |
| `password` | String | **Yes** | Hashed Password (bcrypt) |
| `dateOfBirth`| Date | **Yes** | Used to calculate `age` |
| `age` | Number | No | Auto-calculated on save |
| `gender` | String | **Yes** | `Male`, `Female`, `Other` |
| `bloodGroup` | String | No | Enum: `A+`, `O+`, `B+`, etc. |
| `role` | String | No | `patient` (default), `doctor`, `admin` |
| `location` | Object | No | `{ latitude, longitude, city, state, country }` |
| `hospitalId` | ObjectId | No | Ref: `Hospital` (Only for staff roles) |
| `emergencyContact` | Object | No | `{ name, relation, mobile }` |

---

## 2. Appointments Collection (`appointments`)
**Purpose:** Handles the entire lifecycle of a booking request.
**Key Indexes:** `{ userId: 1, date: -1 }` (User History), `{ hospitalId: 1, status: 1 }` (Hospital Dashboard)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Yes | Appointment ID |
| `userId` | ObjectId | **Yes** | Ref: `User` (The patient) |
| `hospitalId` | String | **Yes** | ID of the hospital (Supports DB ID or API ID) |
| `hospital` | String | **Yes** | Name of the hospital (Snapshot) |
| `hospitalAddress` | String | No | Address snapshot for external hospitals |
| `doctor` | String | **Yes** | Name of the doctor |
| `specialty` | String | **Yes** | Department (e.g., Cardiology) |
| `date` | Date | **Yes** | Date of appointment |
| `time` | String | **Yes** | Time slot (e.g., "10:00 AM") |
| `type` | String | **Yes** | `In-person`, `Telemedicine` |
| `status` | String | No | `pending` (default), `confirmed`, `completed`, `cancelled` |
| `reason` | String | **Yes** | Reason for visit |
| `notes` | String | No | Admin internal notes |
| `confirmedBy` | ObjectId | No | Ref: `User` (Admin who approved it) |

---

## 3. Hospitals Collection (`hospitals`)
**Purpose:** Internal directory for hospitals managed directly by the platform logic.
**Key Indexes:** Location-based `{ 'location.latitude': 1, 'location.longitude': 1 }`

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | String | **Yes** | Hospital Name |
| `city` | String | **Yes** | City Name |
| `type` | String | **Yes** | `Government`, `Private`, `Trust` |
| `address` | String | **Yes** | Full Address |
| `contact` | Object | **Yes** | `{ phone, email, emergency: '108' }` |
| `beds` | Object | No | `{ total, available, icu, icuAvailable }` |
| `resources` | Object | No | `{ oxygen: bool, ventilators: bool, bloodBank: bool }` |
| `location` | Object | No | `{ latitude, longitude }` |
| `rating` | Number | No | 0-5 Star Rating |
| `departments` | Array | No | List of departments and doctors within them |

---

## 4. MedicalRecords Collection (`medicalrecords`)
**Purpose:** Stores digital health history and uploaded reports.
**Key Indexes:** `{ userId: 1, date: -1 }` (Sorted by newest first)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `userId` | ObjectId | **Yes** | Ref: `User` |
| `date` | Date | **Yes** | Date of record |
| `hospital` | String | **Yes** | Hospital Name |
| `doctor` | String | **Yes** | Doctor Name |
| `diagnosis` | String | **Yes** | Main diagnosis text |
| `prescriptions`| Array | No | List of medicine strings |
| `documents` | Array | No | URLs to uploaded reports |
| `notes` | String | No | Additional observations |

---

## 5. HealthAlerts Collection (`healthalerts`)
**Purpose:** Broadcast system for public warnings (e.g., "High Dengue Risk").
**Key Indexes:** `{ isActive: 1, severity: -1 }`

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `title` | String | **Yes** | Headline |
| `severity` | String | **Yes** | `high`, `moderate`, `low` |
| `type` | String | **Yes** | `disease`, `weather`, `pollution` |
| `isActive` | Boolean | No | Default: `true` |
| `description` | String | **Yes** | Detailed info |
| `symptoms` | Array | No | List of symptoms |
| `prevention` | Array | No | List of prevention tips |
| `affectedAreas`| Array | No | List of city names |
| `riskLevel` | Number | No | 0-100 Percentage |
