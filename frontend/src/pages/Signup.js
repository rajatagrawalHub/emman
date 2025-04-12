import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../App.css';

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    gender: '',
    phoneNumber: '',
    state: '',
    nationality: '',
    profession: '',
    residenceType: '',
    interests: ''
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const interestsArray = formData.interests.split(',').map(i => i.trim());
    const body = { ...formData, interests: interestsArray };

    const { success, message } = await signup(body);

    if (success) {
      navigate('/login');
    } else {
      setError(message);
    }
  };

  return (
    <div className="signup-wrapper">
      <div className="signup-card fade-in">
        <h2 className="signup-title">Create an Account</h2>
        <p className="signup-subtitle">Fill in your details to register</p>
        {error && <p className="error-message">{error}</p>}
        <form className="signup-form" onSubmit={handleSubmit}>
          <input name="name" placeholder="Name" required onChange={handleChange} />
          <input name="email" type="email" placeholder="Email" required onChange={handleChange} />
          <input name="password" type="password" placeholder="Password" required onChange={handleChange} />
          <input name="gender" placeholder="Gender" required onChange={handleChange} />
          <input name="phoneNumber" placeholder="Phone Number" required onChange={handleChange} />
          <input name="state" placeholder="State" required onChange={handleChange} />
          <input name="nationality" placeholder="Nationality" required onChange={handleChange} />
          <input name="profession" placeholder="Profession" required onChange={handleChange} />
          <input name="residenceType" placeholder="Residence Type" required onChange={handleChange} />
          <input name="interests" placeholder="Interests (comma separated)" onChange={handleChange} />

          <button type="submit">Register</button>
        </form>
        <p className="login-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
