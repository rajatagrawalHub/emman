import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import ModeratorDashboard from './pages/ModeratorDashboard';
import UserDashboard from './pages/UserDashboard';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Admin-only */}
          <Route element={<ProtectedRoute role="Admin" />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* Moderator-only */}
          <Route element={<ProtectedRoute role="Moderator" />}>
            <Route path="/moderator" element={<ModeratorDashboard />} />
          </Route>

          {/* User-only */}
          <Route element={<ProtectedRoute role="User" />}>
            <Route path="/user" element={<UserDashboard />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
