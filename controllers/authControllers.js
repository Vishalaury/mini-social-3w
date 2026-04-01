const User = require('../models/User');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
    try {
        console.log('Signup request received:', req.body);
        const { fullname, username, email, password } = req.body;

        // Validate required fields
        if (!fullname || !username || !email || !password) {
            console.log('Missing required fields:', { fullname, username, email, password: '***' });
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if user already exists
        // If MongoDB is not connected, use an in-memory fallback store
        let existingUser = null;
        if (mongoose.connection.readyState === 1) {
            existingUser = await User.findOne({ $or: [{ email }, { username }] });
        } else {
            // in-memory store
            global.__INMEMORY_USERS = global.__INMEMORY_USERS || [];
            existingUser = global.__INMEMORY_USERS.find(u => u.email === email || u.username === username) || null;
        }
        if (existingUser) {
            return res.status(400).json({ message: 'Email or username already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        if (mongoose.connection.readyState === 1) {
            const user = new User({
                fullname: fullname,
                username: username,
                email: email,
                password: hashedPassword
            });
            await user.save();
            return res.status(201).json({ message: 'User created successfully' });
        } else {
            // Save to in-memory store so signup can be tested without DB
            global.__INMEMORY_USERS = global.__INMEMORY_USERS || [];
            const user = { id: `u_${Date.now()}`, fullname, username, email, password: hashedPassword };
            global.__INMEMORY_USERS.push(user);
            console.log('Saved user in-memory (no DB):', { username, email });
            return res.status(201).json({ message: 'User created successfully (in-memory)' });
        }
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error during signup' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user
        let user = null;
        if (mongoose.connection.readyState === 1) {
            user = await User.findOne({ email });
        } else {
            global.__INMEMORY_USERS = global.__INMEMORY_USERS || [];
            user = global.__INMEMORY_USERS.find(u => u.email === email) || null;
        }
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        // Create JWT token
        const token = jwt.sign(
            { id: user._id || user.id || null },
            process.env.JWT_SECRET || 'your-default-jwt-secret',
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user._id || user.id || null,
                fullname: user.fullname,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};