const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// dotenv.config();
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const postRoutes = require('./routes/postRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// Serve uploaded files statically so images are accessible from the frontend
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection with optional local fallback when Atlas is unreachable
const connectToMongo = async () => {
  const preferred = process.env.MONGO_URI;
  const localFallback = 'mongodb://127.0.0.1:27017/mini-social';

  const tryConnect = async (uri) => {
    try {
      await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
      console.log(`MongoDB connected (${uri.startsWith('mongodb://127.0.0.1') ? 'local' : 'remote'})`);
      return true;
    } catch (err) {
      console.error(`MongoDB connection error for ${uri}:`, err.message || err);
      return false;
    }
  };

  if (preferred) {
    const ok = await tryConnect(preferred);
    if (ok) return;
    console.warn('Failed to connect to preferred MongoDB. Trying local fallback...');
  }

  // Try local fallback
  const okLocal = await tryConnect(localFallback);
  if (!okLocal) {
    console.warn('Both preferred and local MongoDB connections failed. The app will continue running with in-memory fallback for development.');
  }
};

connectToMongo();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Health endpoint to report DB connection status
app.get('/health', (req, res) => {
  const state = mongoose.connection.readyState; // 0 disconnected, 1 connected, 2 connecting, 3 disconnecting
  res.json({
    server: 'ok',
    mongo: {
      readyState: state,
      connected: state === 1
    }
  });
});

// DB status endpoint - returns counts and whether using DB or in-memory
app.get('/db-status', async (req, res) => {
  const state = mongoose.connection.readyState;
  try {
    if (state === 1) {
      // when connected, report collection counts
      const Users = require('./models/User');
      const SocialPost = require('./models/SocialPost');
      const usersCount = await Users.countDocuments().catch(() => null);
      const postsCount = await SocialPost.countDocuments().catch(() => null);
      return res.json({ connected: true, usersCount, postsCount });
    }

    // fallback: report in-memory counts
    const users = global.__INMEMORY_USERS || [];
    const posts = global.__INMEMORY_POSTS || [];
    return res.json({ connected: false, inMemory: { users: users.length, posts: posts.length } });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
