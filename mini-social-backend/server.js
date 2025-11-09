const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');

const app = express();

// Allow specific frontend domain (Vercel)
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'https://mini-social-3w-bxg6.vercel.app', // correct frontend domain
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);


//  Increase payload size (for base64 images)
app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: true, limit: '12mb' }));

//  Root route for Render health check
app.get('/', (req, res) => {
  res.send('Backend is running fine on Render!');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

const PORT = process.env.PORT || 5000;

//  MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

//  Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
