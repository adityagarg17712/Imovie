const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const setupSeatSocket = require('./sockets/seatSocket');

// Route imports
const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const theatreRoutes = require('./routes/theatreRoutes');
const showRoutes = require('./routes/showRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const server = http.createServer(app);

// Connect to Database
connectDB();

// Setup Socket.io
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all during dev/demo or specify clientUrl
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Attach socket.io instance to req for controllers if needed
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Initialize real-time seat lock/unlock listeners
setupSeatSocket(io);

// Core Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Apply general rate limiter
app.use('/api', apiLimiter);

// Static uploads folder for images/posters
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Fast check for active MongoDB connection (prevents 10s buffering timeouts)
app.use('/api', (req, res, next) => {
  if (req.path === '/health') return next();
  const mongoose = require('mongoose');
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'MongoDB service is not running. Please start MongoDB (e.g. `brew services start mongodb-community`) or configure a valid MONGO_URI in backend/.env',
    });
  }
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    system: 'IMovies Cinema Platform API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/theatres', theatreRoutes);
app.use('/api/shows', showRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Catch-all 404 handler for undefined API routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found`,
  });
});

// Centralized error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🎬 IMovies Cinema Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`🚀 HTTP API listening on: http://localhost:${PORT}`);
  console.log(`⚡ Socket.io real-time engine ready`);
  console.log(`=======================================================`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('[Unhandled Rejection Error]:', err.message);
});

module.exports = { app, server };
