import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';

const Signup = () => {
  const [form, setForm] = useState({ fullname: '', username: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/signup', form);
  // after successful signup, navigate to the login page
  navigate('/login');
    } catch (err) {
      alert(err.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <div className="app-bg">
      <div className="form-container">
        <h2>Signup</h2>
        <form className="signup-form" onSubmit={handleSubmit}>
        <label>
          Full Name
          <input name="fullname" placeholder="Full Name" value={form.fullname} onChange={handleChange} required />
        </label>
        <label>
          Username
          <input name="username" placeholder="Username" value={form.username} onChange={handleChange} required />
        </label>
        <label>
          Email
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Password
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        </label>
        <button type="submit">Create account</button>
      </form>

        <p className="form-note">
          Already have an account? <Link to="/login" className="form-link">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
