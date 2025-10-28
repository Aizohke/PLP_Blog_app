// server.js - Main server file for the MERN blog application
// Optimized for Vercel Serverless Functions

// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Connect to DB
const connectDB = require('./config/db');

// Models for seeding
const Category = require('./models/Category');

// Import routes
const postRoutes = require('./routes/posts');
const categoryRoutes = require('./routes/categories');
const authRoutes = require('./routes/auth');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists (for local development)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('📁 Created uploads directory');
  } catch (err) {
    console.log('⚠️ Could not create uploads directory (expected on Vercel)');
  }
}

// MongoDB Connection - Handle serverless environment with connection caching
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    console.log('Using cached database connection');
    return cachedDb;
  }

  try {
    const connection = await connectDB();
    cachedDb = connection;
    console.log('✅ Connected to MongoDB');
    return connection;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    throw error;
  }
}

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:4173',
    'https://plp-blog-app-yi4o.vercel.app/', // UPDATE THIS with your actual frontend URL
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// Log requests in development mode
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

// ==========================================
// 🧩 Seed predefined categories
// ==========================================
const predefinedCategories = [
  { name: 'Technology', slug: 'technology' },
  { name: 'Engineering', slug: 'engineering' },
  { name: 'News', slug: 'news' },
  { name: 'Innovation', slug: 'innovation' },
  { name: 'Education', slug: 'education' },
  { name: 'Lifestyle', slug: 'lifestyle' },
];

const seedCategoriesIfMissing = async () => {
  try {
    for (const cat of predefinedCategories) {
      const exists = await Category.findOne({ slug: cat.slug });
      if (!exists) {
        await Category.create(cat);
        console.log(`🟢 Seeded category: ${cat.name}`);
      }
    }
  } catch (err) {
    console.error('Error seeding categories:', err.message || err);
  }
};

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'MERN Blog API is running',
    version: '1.0.0',
    status: 'active',
    endpoints: {
      auth: '/api/auth',
      posts: '/api/posts',
      categories: '/api/categories',
      health: '/api/health'
    }
  });
});

// Health check route
app.get('/api/health', async (req, res) => {
  try {
    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    res.json({ 
      status: 'ok',
      database: dbStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/categories', categoryRoutes);

// 404 handler - must be after all routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack || err);
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: err.message
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid ID format'
    });
  }
  
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      error: 'Duplicate field value entered'
    });
  }
  
  // Default error response
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ==========================================
// Start server (local development)
// ==========================================
const start = async () => {
  try {
    await connectToDatabase();
    await seedCategoriesIfMissing();

    // Only listen on port for local development
    if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📡 API available at http://localhost:${PORT}/api`);
        console.log(`🏥 Health check at http://localhost:${PORT}/api/health`);
      });
    }
  } catch (err) {
    console.error('❌ Failed to start server:', err.message || err);
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

// ==========================================
// For Vercel serverless deployment
// ==========================================
if (process.env.VERCEL) {
  // Connect and seed on serverless cold start
  connectToDatabase()
    .then(() => seedCategoriesIfMissing())
    .catch(err => console.error('Serverless init error:', err));
} else {
  // Start server for local development
  start();
}

// Handle unhandled promise rejections (for local development)
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err.message);
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

// Handle SIGTERM gracefully (for local development)
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  if (mongoose.connection.readyState === 1) {
    mongoose.connection.close(() => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

// Export for Vercel serverless functions
module.exports = app;
