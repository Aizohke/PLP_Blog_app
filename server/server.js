// server/server.js
const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

// Load environment variables
dotenv.config();

// Connect to DB
const connectDB = require('./config/db');

// Models for seeding
const Category = require('./models/Category');

// Routes
const postRoutes = require('./routes/posts');
const categoryRoutes = require('./routes/categories');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory');
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// Log requests in development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

// API routes
app.use('/api/posts', postRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'MERN Blog API is running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      posts: '/api/posts',
      categories: '/api/categories',
    },
  });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack || err);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Server Error',
  });
});

// ==========================================
// 🧩 Seed predefined categories (frontend match)
// ==========================================
const predefinedCategories = [
  { name: 'Technology', slug: 'Technology' },
  { name: 'Engineering', slug: 'engineering' },
  { name: 'news', slug: 'news' },
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

// Start server after DB connection and seeding
const start = async () => {
  try {
    await connectDB();
    await seedCategoriesIfMissing();

    app.listen(PORT, () => {
      console.log('✅ Connected to MongoDB');
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message || err);
    process.exit(1);
  }
};

start();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

// For Vercel serverless deployment
if (process.env.VERCEL) {
  module.exports = app;
} else {
  // Connect to MongoDB and start server (for local development)
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
      console.log("✅ Connected to MongoDB");
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📡 API available at http://localhost:${PORT}/api`);
      });
    })
    .catch((err) => {
      console.error("❌ Failed to connect to MongoDB", err);
      process.exit(1);
    });
}

// Always connect to MongoDB for serverless
if (process.env.VERCEL) {
  mongoose.connect(process.env.MONGODB_URI).catch((err) => {
    console.error("MongoDB connection error:", err);
  });
}

module.exports = app;
