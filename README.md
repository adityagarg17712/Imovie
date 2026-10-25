# 🎬 IMovies - Full-Stack Cinema Booking & Management System

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-brightgreen.svg)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.7-black.svg)](https://socket.io/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

A production-ready full-stack MERN (MongoDB, Express.js, React.js, Node.js) cinema management platform enabling moviegoers to explore showtimes, view live seat maps, and book tickets with real-time seat lock tracking. Includes role-based security, automated pricing tiers, simulated payment gateways, QR code tickets, and an administrator dashboard for cinema management.

---

## 🌟 Key Highlights & Architecture

- **Real-Time Seat Management**: Socket.io duplex engine locks seats during active customer selections (5-minute expiration) preventing double-booking race conditions.
- **Role-Based Access Control (RBAC)**: Secure JWT authentication with encrypted passwords (`bcryptjs`), user dashboard, and admin-only management endpoints.
- **Cinema Scheduling & Dynamic Pricing**: Supports multi-screen theatres, automated seat matrix generation (Silver, Gold, VIP), and date/city filtering.
- **Paperless E-Tickets with QR Codes**: High-resolution scannable barcodes dynamically encoded for turnstile verification.
- **Complete RESTful API**: Documented endpoints with rate limiting, centralized error handling, and indexing on MongoDB collections.

---

## 🏗 System Architecture & Database Design

```mermaid
graph TD
    Client["React.js Frontend (Vite + Bootstrap)"]
    SocketClient["Socket.io Client (Real-time Seats)"]
    API["Express.js Server (Port 5000)"]
    SocketServer["Socket.io Engine"]
    Auth["JWT & Bcrypt Middleware"]
    DB[("MongoDB 7.0")]

    Client -->|REST API / HTTPS| API
    SocketClient <-->|WebSockets (Bi-directional)| SocketServer
    API --> Auth
    Auth --> DB
    SocketServer <--> DB
```

### 🗄 Collections (8 Schemas)
1. **Users**: Name, email, hashed password, role (`user`/`admin`), phone, avatar.
2. **Movies**: Title, description, poster, backdrop, genres, languages, duration, rating, formats (2D/3D/IMAX), cast, director, certificate, status.
3. **Theatres**: Name, city, location, address, total screens, screen layouts.
4. **Shows**: Movie reference, Theatre reference, screen number, date (`YYYY-MM-DD`), startTime, endTime, pricing (`silver`, `gold`, `vip`), available seats count.
5. **Seats**: Show reference, seat number (e.g., `B4`), row, col, tier, price, status (`AVAILABLE`, `LOCKED`, `BOOKED`), `lockedBy`, `lockedAt`.
6. **Bookings**: Unique reference (`IMOV-YYYYMMDD-XXXX`), user, show, movie, theatre, seats, breakdown, QR code data URL, booking status (`CONFIRMED`, `CANCELLED`).
7. **Payments**: Transaction ID, booking reference, method (`CARD`, `UPI`, `NETBANKING`), amount, status (`SUCCESS`, `REFUNDED`).
8. **Notifications**: User reference, title, message, type, read status.

---

## 🚀 Quick Start Guide

### Option 1: Docker Compose (Instant 1-Command Startup)

```bash
docker-compose up --build
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`
- MongoDB: `localhost:27017`

---

### Option 2: Local Development Setup

#### Prerequisites
- Node.js (v18+) & npm
- MongoDB Community Server running locally on `mongodb://127.0.0.1:27017`

#### 1. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Seed sample movies, theatres, screens, shows, and demo users
npm run seed

# Start development server
npm run dev
# or: npm start
```

#### 2. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 🔑 Demo Credentials

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@imovies.com` | `Admin@Password123` | Full Admin Dashboard, Movie CRUD, Show Scheduler, Analytics |
| **Customer** | `user@imovies.com` | `User@Password123` | Ticket booking, Seat selection, My Bookings, Ticket cancellation |

*(Note: The login page includes 1-click **Quick Fill** buttons for both accounts for instant evaluation).*

---

## 🧪 Testing & Validation

### Automated Integration Test Runner
The repository includes an automated integration test script validating:
- Health check
- User and Admin JWT Authentication
- Role-based route protection (ensuring HTTP 403 on unauthorized access)
- Movie catalog search and filters
- Show seat layout retrieval
- Atomic seat reservation (verifies seat status turns `BOOKED`)
- Cancellation and full seat release (verifies seat status turns back to `AVAILABLE`)

Run the test suite:
```bash
cd backend
npm test
# or: node tests/api_tests.js
```

### Postman Collection
Import `tests/postman_imovies_collection.json` into Postman to test all endpoints.

---

## 📁 Repository Structure

```
imovies/
├── backend/
│   ├── config/              # MongoDB connection with retry logic
│   ├── controllers/         # Business logic for Auth, Movies, Shows, Bookings, Payments, Admin
│   ├── middleware/          # JWT protection, Role verification, Rate limiter, Centralized errors
│   ├── models/              # 8 Mongoose database schemas
│   ├── routes/              # Express API route declarations
│   ├── sockets/             # Socket.io real-time seat lock/unlock handlers
│   ├── utils/               # Database seeder script
│   ├── server.js            # Express & Socket.io server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── assets/          # Cinematic styles and CSS variables
│   │   ├── components/      # Navbar, MovieCard, SeatGrid, ProtectedRoute, Footer
│   │   ├── context/         # AuthContext and BookingContext
│   │   ├── pages/           # Home, MovieDetails, SeatSelection, Checkout, Confirmation, Dashboard, Admin, Login, Register
│   │   ├── services/        # Axios API client and Socket.io client
│   │   ├── App.jsx          # Route hierarchy
│   │   └── main.jsx
│   ├── vite.config.js
│   └── package.json
├── tests/
│   ├── api_tests.js         # Automated end-to-end integration tests
│   └── postman_imovies_collection.json
├── docker-compose.yml       # Production-ready orchestration
├── Dockerfile.backend
├── Dockerfile.frontend
└── README.md
```

---

## 🛡 Security & Performance Optimizations

1. **Password Encryption**: All passwords salted and hashed using `bcryptjs` (cost factor 10) before MongoDB persistence.
2. **API Rate Limiting**: `express-rate-limit` prevents brute-force login attempts (20 max attempts per 15 minutes) and general DDOS mitigation.
3. **Query Indexing**: Compound and text indices created on `{ title: "text", genres: "text" }`, `{ movie: 1, date: 1 }`, and unique `{ show: 1, seatNumber: 1 }`.
4. **Stale Seat Cleanup**: Auto-expiration checks automatically free seats locked longer than 5 minutes if the user abandons checkout.
