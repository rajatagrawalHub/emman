import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../App.css';

const UserDashboard = () => {
  const { logout, user } = useAuth();

  const [filters, setFilters] = useState({
    status: '',
    title: '',
    venue: '',
    mode: '',
    category: '',
    approvalStatus: 'Approved',
    certificate: '',
  });

  const [registrationFilter, setRegistrationFilter] = useState('all');
  const [timingFilter, setTimingFilter] = useState('all');

  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');

  const [categories, setCategories] = useState([]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:5000/category/approved');
      setCategories(res.data.categories);
    } catch {
      setError('Failed to load categories');
    }
  };
  
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchFilteredEvents = async () => {
    try {
      const filterBody = { ...filters };

      if (filterBody.certificate === 'true') {
        filterBody.certificate = true;
      } else if (filterBody.certificate === 'false') {
        filterBody.certificate = false;
      } else {
        delete filterBody.certificate;
      }

      const res = await axios.post('http://localhost:5000/event/filterby', filterBody);
      setEvents(res.data.events);
    } catch (err) {
      setError('Error fetching events');
    }
  };

  const registerForEvent = async (eventId) => {
    try {
      const res = await axios.post('http://localhost:5000/event/register', {
        userId: user._id,
        eventId
      });
      alert(res.data.message);
      fetchFilteredEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  const deregisterFromEvent = async (eventId) => {
    try {
      const res = await axios.post('http://localhost:5000/event/deregister', {
        userId: user._id,
        eventId,
      });
      alert(res.data.message);
      fetchFilteredEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Deregistration failed');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    fetchFilteredEvents();
  }, [filters]);

  const isUserRegistered = (event) => {
    return (event.participants || []).some((p) => p._id === user._id);
  };

  const applyAdditionalFilters = () => {
    return events.filter((event) => {
      const now = new Date();
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      const registered = isUserRegistered(event);

      const matchesRegistration =
        registrationFilter === 'all' ||
        (registrationFilter === 'registered' && registered) ||
        (registrationFilter === 'unregistered' && !registered);

      const matchesTiming =
        timingFilter === 'all' ||
        (timingFilter === 'upcoming' && eventStart > now) ||
        (timingFilter === 'completed' && eventEnd < now) ||
        (timingFilter === 'ongoing' && eventStart <= now && eventEnd >= now);

      return matchesRegistration && matchesTiming;
    });
  };

  const filteredEvents = applyAdditionalFilters();

  return (
    <div className="dashboard-container">
      <h2>User Dashboard</h2>
      <button className="logout-btn" onClick={logout}>Logout</button>

      <h3>Filter Events</h3>
      <div className="filter-form">
        <input name="title" placeholder="Title" onChange={handleChange} />
        <input name="venue" placeholder="Venue" onChange={handleChange} />
        <select name="category" onChange={handleChange}>
          <option value="">Category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
        <select name="mode" onChange={handleChange}>
          <option value="">Mode</option>
          <option>Online</option>
          <option>Offline</option>
          <option>Hybrid</option>
        </select>
        <select name="status" onChange={handleChange}>
          <option value="">Status</option>
          <option>Upcoming</option>
          <option>Completed</option>
          <option>Freezed</option>
        </select>
        <select name="certificate" onChange={handleChange}>
          <option value="">Certificate</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>

      {/* New dropdown filters */}
      <div className="filter-form">
        <select value={registrationFilter} onChange={(e) => setRegistrationFilter(e.target.value)}>
          <option value="all">All Events</option>
          <option value="registered">Registered Events</option>
          <option value="unregistered">Unregistered Events</option>
        </select>
        <select value={timingFilter} onChange={(e) => setTimingFilter(e.target.value)}>
          <option value="all">All Timings</option>
          <option value="upcoming">Upcoming Events</option>
          <option value="ongoing">Ongoing Events</option>
          <option value="completed">Completed Events</option>
        </select>
      </div>

      {error && <p className="error">{error}</p>}

      <h3>Available Events</h3>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Venue</th>
            <th>Mode</th>
            <th>Dates</th>
            <th>Certificate</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredEvents.length === 0 ? (
            <tr><td colSpan="7">No events found</td></tr>
          ) : (
            filteredEvents.map((event) => {
              const now = new Date();
              const registered = isUserRegistered(event);
              const eventStart = new Date(event.startDate);
              const eventEnd = new Date(event.endDate);
              const isOngoing = eventStart <= now && eventEnd >= now;
              const isCompleted = eventEnd < now;
              const canDeregister = eventStart - now > 6 * 60 * 60 * 1000;

              return (
                <tr key={event._id}>
                  <td>{event.title}</td>
                  <td>{event.category}</td>
                  <td>{event.venue}</td>
                  <td>{event.mode}</td>
                  <td>
                    {eventStart.toLocaleDateString()} - {eventEnd.toLocaleDateString()}
                  </td>
                  <td>{event.certificate ? 'Yes' : 'No'}</td>
                  <td>
                    {registered ? (
                      canDeregister ? (
                        <button onClick={() => deregisterFromEvent(event._id)}>Deregister</button>
                      ) : (
                        <span>Registered</span>
                      )
                    ) : (
                      (!isOngoing && !isCompleted) ? (
                        <button onClick={() => registerForEvent(event._id)}>Register</button>
                      ) : (
                        <span>Registration Closed</span>
                      )
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserDashboard;
