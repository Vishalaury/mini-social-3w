// // // const express = require('express');
// // // const mongoose = require('mongoose');
// // // const cors = require('cors');
// // // const dotenv = require('dotenv');
// // // dotenv.config();

// // // const authRoutes = require('./routes/authRoutes');
// // // const postRoutes = require('./routes/postRoutes');

// // // const app = express();
// // // app.use(cors());
// // // // Increase payload size to accept base64-encoded images sent from the frontend.
// // // // Default limit is too small and causes `PayloadTooLargeError` when uploading images.
// // // app.use(express.json({ limit: '12mb' }));
// // // app.use(express.urlencoded({ extended: true, limit: '12mb' }));

// // // app.use('/api/auth', authRoutes);
// // // app.use('/api/posts', postRoutes);

// // // const PORT = process.env.PORT || 5000;

// // // mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mini-social', {
// // //   useNewUrlParser: true,
// // //   useUnifiedTopology: true
// // // })
// // // .then(() => console.log('MongoDB connected'))
// // // .catch(err => console.log('MongoDB connection error:', err));

// // // app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// // const express = require('express');
// // const mongoose = require('mongoose');
// // const cors = require('cors');
// // const dotenv = require('dotenv');
// // dotenv.config();

// // const authRoutes = require('./routes/authRoutes');
// // const postRoutes = require('./routes/postRoutes');

// // const app = express();
// // app.use(cors());

// // // Increase payload size to accept base64-encoded images sent from the frontend.
// // app.use(express.json({ limit: '12mb' }));
// // app.use(express.urlencoded({ extended: true, limit: '12mb' }));

// // //  Add this root route (important for Render health check)
// // app.get('/', (req, res) => {
// //   res.send('Backend is running!');
// // });

// // app.use('/api/auth', authRoutes);
// // app.use('/api/posts', postRoutes);

// // const PORT = process.env.PORT || 5000;

// // mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mini-social', {
// //   useNewUrlParser: true,
// //   useUnifiedTopology: true
// // })
// // .then(() => console.log('MongoDB connected'))
// // .catch(err => console.log('MongoDB connection error:', err));

// // app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const dotenv = require('dotenv');
// dotenv.config();

// const authRoutes = require('./routes/authRoutes');
// const postRoutes = require('./routes/postRoutes');

// const app = express();

// //  Allow frontend domain for CORS (important for Render + Vercel)
// app.use(
//   cors({
//     origin: [
//       'http://localhost:3000',
//       'https://mini-social-3w.vercel.app' //  apna Vercel frontend URL yahan daalna
//     ],
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     credentials: true,
//   })
// );

// //  Increase payload size to accept base64 images
// app.use(express.json({ limit: '12mb' }));
// app.use(express.urlencoded({ extended: true, limit: '12mb' }));

// // Root route (Render health check)
// app.get('/', (req, res) => {
//   res.send(' Backend is running fine on Render!');
// });

// app.use('/api/auth', authRoutes);
// app.use('/api/posts', postRoutes);

// const PORT = process.env.PORT || 5000;

// //  MongoDB connection
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log(' MongoDB connected'))
//   .catch(err => console.log(' MongoDB connection error:', err));

// app.listen(PORT, () => console.log(` Server running on port ${PORT}`));


const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');

const app = express();

// Allow frontend domain for CORS (important for Render + Vercel)
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'https://mini-social-3w-4rdp.vercel.app' // Apna actual Vercel frontend URL
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

//  Increase payload size to accept base64-encoded images
app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: true, limit: '12mb' }));

//  Root route (Render health check)
app.get('/', (req, res) => {
  res.send(' Backend is running fine on Render!');
});

//  API Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

const PORT = process.env.PORT || 5000;

//  MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log(' MongoDB connected'))
  .catch(err => console.log(' MongoDB connection error:', err));

// Start Server
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
