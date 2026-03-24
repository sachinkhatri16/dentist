# 🦷 DentiCare - Dental Clinic Management System

A modern, full-stack web application for managing a dental clinic's appointments, patients, and medical records. Built with the MERN stack (MongoDB, Express.js, React, Node.js).

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based secure authentication
- Role-based access control: **Admin**, **Receptionist**, **Dentist**, **Patient**
- Password hashing with bcrypt
- Audit logs for all user actions

### 👥 Patient Management
- Full CRUD operations for patient profiles
- Store: name, age, contact, medical history, allergies, blood type
- Emergency contact information
- Insurance information
- Search and filter functionality
- Auto-generated patient IDs (e.g., P00001)

### �� Appointment System
- **FullCalendar** integration with day/week/month views
- Book, reschedule, and cancel appointments
- **Conflict prevention** — no double booking
- Assign dentist and time slots
- Appointment types: checkup, cleaning, filling, extraction, etc.
- Status tracking: scheduled → confirmed → in-progress → completed

### 🗓️ Dentist Scheduling
- Manage working hours per day
- Set leave, holidays, emergency-only days
- View today's schedule and appointments
- Room/chair assignment

### 📋 Electronic Medical Records (EMR)
- Diagnosis, procedures, prescriptions, clinical notes
- File attachments (X-rays, reports, images)
- Linked to appointments and patients
- Follow-up date tracking

### 📊 Dashboard (Role-Based)
- **Admin**: System overview, all stats, revenue, user management
- **Receptionist**: Appointments, patients, billing
- **Dentist**: Personal schedule, patient history

### 💰 Billing
- Create invoices linked to appointments/procedures
- Line items with quantity, unit price, discount
- Tax calculation and payment recording
- Status: pending → partial → paid

### 📈 Reports & Analytics
- Appointment statistics (by status, type, dentist, daily trend)
- Revenue reports (monthly billed vs collected)
- Dentist workload analysis
- Interactive charts with Recharts

### 🔒 Security
- Password hashing (bcrypt)
- JWT authentication
- Role-based route protection
- Comprehensive audit logs

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v16+ (v18+ recommended)
- **MongoDB** v5+ (local or Atlas)
- **npm** v8+

### Project Structure

```
dentist/
├── backend/                    # Node.js + Express API
│   ├── config/db.js            # MongoDB connection
│   ├── controllers/            # Route handlers
│   ├── middleware/             # auth.js, upload.js
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # Express routes
│   ├── utils/auditLogger.js
│   ├── seed.js                 # Database seeding
│   ├── server.js
│   └── .env.example
└── frontend/                   # React application
    ├── public/index.html
    ├── src/
    │   ├── components/
    │   │   ├── admin/          # User management
    │   │   ├── appointments/   # Calendar + booking
    │   │   ├── auth/           # Login, Register, Profile
    │   │   ├── billing/        # Invoices
    │   │   ├── common/         # Layout, Sidebar
    │   │   ├── dashboard/      # Role-based dashboards
    │   │   ├── dentists/       # Schedule management
    │   │   ├── landing/        # Landing page
    │   │   ├── medical-records/# EMR
    │   │   ├── patients/       # Patient CRUD
    │   │   └── reports/        # Charts + Audit Logs
    │   ├── context/AuthContext.js
    │   ├── services/api.js
    │   ├── App.js
    │   └── index.js
    └── .env.example
```

---

## ⚙️ Installation & Setup

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Seed database with demo data
npm run seed

# Start development server
npm run dev
# Server runs on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit if needed (default: http://localhost:5000/api)

# Start development server
npm start
# App runs on http://localhost:3000
```

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@denticare.com | admin123 |
| Dentist | dentist1@denticare.com | dentist123 |
| Dentist (Ortho) | dentist2@denticare.com | dentist123 |
| Receptionist | receptionist@denticare.com | reception123 |

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` — Login
- `POST /api/auth/register` — Register
- `GET /api/auth/me` — Current user (Private)
- `PUT /api/auth/password` — Change password (Private)
- `GET /api/auth/users` — List users (Admin)

### Patients
- `GET /api/patients` — List patients
- `POST /api/patients` — Create patient (Admin/Receptionist)
- `GET /api/patients/:id` — Get patient
- `PUT /api/patients/:id` — Update patient
- `DELETE /api/patients/:id` — Delete patient (Admin)

### Appointments
- `GET /api/appointments` — List (with date range filter)
- `POST /api/appointments` — Book (conflict-checked)
- `PUT /api/appointments/:id` — Update/reschedule/cancel
- `DELETE /api/appointments/:id` — Delete (Admin)

### Dentists
- `GET /api/dentists` — List dentists
- `GET /api/dentists/:id/schedule` — Get schedule
- `POST /api/dentists/:id/schedule` — Set schedule
- `GET /api/dentists/:id/today` — Today's appointments

### Medical Records
- `GET /api/medical-records` — List records
- `POST /api/medical-records` — Create (Admin/Dentist)
- `POST /api/medical-records/:id/attachments` — Upload files

### Billing
- `GET /api/billing` — List invoices
- `POST /api/billing` — Create invoice
- `PUT /api/billing/:id` — Update/record payment

### Reports
- `GET /api/reports/dashboard` — Dashboard stats
- `GET /api/reports/appointments` — Appointment stats
- `GET /api/reports/revenue` — Revenue (Admin)
- `GET /api/reports/dentist-workload` — Workload (Admin)

### Audit Logs
- `GET /api/audit-logs` — View logs (Admin)

---

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** — REST API
- **MongoDB** + **Mongoose** — Database
- **JWT** — Authentication
- **bcryptjs** — Password hashing
- **multer** — File uploads

### Frontend
- **React 18** — UI framework
- **Material UI (MUI) v5** — Components
- **FullCalendar v5** — Appointment calendar
- **Recharts** — Charts/analytics
- **React Router v6** — Navigation
- **Axios** — HTTP client

---

## 📝 License

MIT License
