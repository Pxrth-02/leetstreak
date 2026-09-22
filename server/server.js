import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/leetstreak';

// Middlewares
app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    module: 1,
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.path}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Start Express server immediately
app.listen(PORT, () => {
  console.log(`LeetStreak API Server running on port ${PORT}`);
  console.log(`CORS allowed origin: ${CLIENT_URL}`);
});

// Attempt MongoDB Connection asynchronously in background
async function initDb() {
  try {
    console.log(`Attempting MongoDB connection to ${MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}...`);
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log('MongoDB connected successfully.');
  } catch (error) {
    console.warn('MongoDB connection note:', error.message);
    console.warn('Running with development in-memory store. Provide MONGO_URI in .env for persistent Atlas storage.');
  }
}

initDb();

export default app;
