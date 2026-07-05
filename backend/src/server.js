const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import SQLite connection initializer
const { connectDB } = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/content');

const app = express();

// Connect and Initialize SQLite DB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Uploaded Files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);

// Simple root healthcheck
app.get('/', (req, res) => {
  res.send('Romantic Birthday Website API is running with SQLite...');
});

// Port configuration
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT} (SQLite Backend)`);
});
