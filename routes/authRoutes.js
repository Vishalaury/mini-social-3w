// const express = require('express');
// const router = express.Router();
// const authController = require('../controllers/authControllers');

// router.post('/signup', authController.signup);
// router.post('/login', authController.login);

// module.exports = router;


const User = require('../models/User');
const bcrypt = require('bcryptjs'); // password hash ke liye
const jwt = require('jsonwebtoken');

// Signup controller
exports.signup = async (req, res) => {
  const { fullname, username, email, password } = req.body;

  try {
    // 1️⃣ Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // 2️⃣ Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3️⃣ Create and save new user
    const newUser = new User({
      fullname,
      username,
      email,
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Signup failed' });
  }
};

// Login controller
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1️⃣ Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });

    // 2️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    // 3️⃣ Create JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET || 'secret123', // secret key
      { expiresIn: '7d' }
    );

    res.json({ message: 'Login successful', token, user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Login failed' });
  }
};
