import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { email, role }
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  const login = async (email, password) => {
    try {
      const res = await axios.post('http://localhost:5000/auth/login', {
        email,
        password,
      });

      const { token, message } = res.data;
      const decoded = parseJwt(token);

      setUser(decoded.user);
      setToken(token);
      localStorage.setItem('token', token);
      return { success: true, message };
    } catch (error) {
      return { success: false, message: error?.response?.data?.message };
    }
  };

  const signup = async (formData) => {
    try {
      const res = await axios.post('http://localhost:5000/auth/signup', formData);
      return { success: true, message: res?.data?.message };
    } catch (error) {
      return { success: false, message: error?.response?.data?.message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('token');
  };

  useEffect(() => {
    if (token) {
      const decoded = parseJwt(token);
      setUser(decoded.user);
    }
  }, [token]);

  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return {};
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
