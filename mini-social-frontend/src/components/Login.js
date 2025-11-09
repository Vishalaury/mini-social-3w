import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('username', res.data.user.username);
      navigate('/feed');
    } catch (err) {
      alert(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="app-bg">

      <div className="auth-container">
        <div className="form-container login-form">
          <h2>Welcome back</h2>
          <p className="auth-subtitle">Sign in to your account to continue</p>
          
          <form onSubmit={handleSubmit}>
            <input 
              name="email" 
              type="email" 
              placeholder="Email" 
              onChange={handleChange} 
              required 
            />
            <input 
              name="password" 
              type="password" 
              placeholder="Password" 
              onChange={handleChange} 
              required 
            />
            <button type="submit" className="primary-button">
              Sign in to your account
            </button>
          </form>
        </div>

        <div className="auth-divider">
          <span>New to Mini Social?</span>
        </div>

        <div className="signup-option">
          <p>Create an account to connect with friends and share moments</p>
          <button 
            onClick={() => navigate('/signup')} 
            className="secondary-button"
          >
            Create new account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
