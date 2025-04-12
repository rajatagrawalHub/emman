import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../App.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { success, message } = await login(formData.email, formData.password);

    if (success) {
      const userRole = JSON.parse(atob(localStorage.getItem('token').split('.')[1])).user.role;
      if (userRole === 'Admin') navigate('/admin');
      else if (userRole === 'Moderator') navigate('/moderator');
      else navigate('/user');
    } else {
      setError(message);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card fade-in">
        <h2 className="login-title">Welcome Back</h2>
        <p className="login-subtitle">Login to your account</p>
        {error && <p className="error-message">{error}</p>}
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            value={formData.email}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            value={formData.password}
            onChange={handleChange}
          />
          <button type="submit">Login</button>
        </form>
        <p className="signup-link">
          Don’t have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
