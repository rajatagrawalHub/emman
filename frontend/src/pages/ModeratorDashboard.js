import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../App.css';

const ModeratorDashboard = () => {
  const { user, token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('events'); // 'events' or 'categories'

  const [categories, setCategories] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [editingEventId, setEditingEventId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    numberOfDays: 1,
    maxParticipants: 100,
    mode: 'Offline',
    venue: '',
    budget: '',
    budgetAmount: 0
  });

  const [categoryRequest, setCategoryRequest] = useState({
    name: '',
    description: ''
  });

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:5000/category/approved');
      setCategories(res.data.categories);
    } catch {
      setError('Failed to fetch categories');
    }
  };

  const fetchMyEvents = async () => {
    try {
      const res = await axios.post('http://localhost:5000/event/filterby', {
        proposedBy: user._id,
      });
      setMyEvents(res.data.events);
    } catch (err) {
      setError('Failed to fetch your events');
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchMyEvents();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const eventBody = {
      ...formData,
      proposedBy: user._id,
    };

    try {
      if (editingEventId) {
        await axios.post('http://localhost:5000/event/edit', {
          ...eventBody,
          eventid: editingEventId
        });
        setMessage('Event updated successfully');
      } else {
        await axios.post('http://localhost:5000/event/create', eventBody);
        setMessage('Event proposed successfully');
      }

      resetForm();
      fetchMyEvents();
    } catch (err) {
      setError(editingEventId ? 'Failed to update event' : 'Failed to propose event');
    }
  };

  const handleEdit = (event) => {
    const formatDate = (dateStr) => dateStr ? new Date(dateStr).toISOString().split('T')[0] : '';
    setFormData({
      title: event.title,
      description: event.description,
      category: event.category,
      startDate: formatDate(event.startDate),
      endDate: formatDate(event.endDate),
      startTime: event.startTime,
      endTime: event.endTime,
      numberOfDays: event.numberOfDays,
      maxParticipants: event.maxParticipants,
      mode: event.mode,
      venue: event.venue,
      budget: event.budget,
      budgetAmount: event.budgetAmount
    });
    setEditingEventId(event._id);
    setMessage('');
    setError('');
  };

  const cancelEdit = () => {
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      numberOfDays: 1,
      maxParticipants: 100,
      mode: 'Offline',
      venue: '',
      budget: '',
      budgetAmount: 0,
    });
    setEditingEventId(null);
    setMessage('');
    setError('');
  };

  const handleCategoryRequestChange = (e) => {
    const { name, value } = e.target;
    setCategoryRequest(prev => ({ ...prev, [name]: value }));
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/category/create', categoryRequest);
      setMessage('Category requested successfully');
      setCategoryRequest({ name: '', description: '' });
      fetchCategories();
    } catch {
      setError('Failed to submit category request');
    }
  };

  return (
    <div className="dashboard-container">
      <h2>Moderator Dashboard</h2>
      <button className="logout-btn" onClick={logout}>Logout</button>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      <div className="tab-buttons">
        <button onClick={() => setActiveTab('events')} className={activeTab === 'events' ? 'active' : ''}>Propose Event</button>
        <button onClick={() => setActiveTab('categories')} className={activeTab === 'categories' ? 'active' : ''}>Request Category</button>
      </div>

      {activeTab === 'events' && (
        <>
          <h3>{editingEventId ? 'Edit Event' : 'Propose a New Event'}</h3>
          <form className="event-form" onSubmit={handleSubmit}>
            <input name="title" placeholder="Title" required value={formData.title} onChange={handleChange} />
            <textarea name="description" placeholder="Description" required maxLength={500} value={formData.description} onChange={handleChange}></textarea>
            <select name="category" value={formData.category} onChange={handleChange} required>
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
            <input type="date" name="startDate" required value={formData.startDate} onChange={handleChange} />
            <input type="date" name="endDate" required value={formData.endDate} onChange={handleChange} />
            <input type="time" name="startTime" required value={formData.startTime} onChange={handleChange} />
            <input type="time" name="endTime" required value={formData.endTime} onChange={handleChange} />
            <input type="number" name="numberOfDays" placeholder="Number of Days" value={formData.numberOfDays} onChange={handleChange} />
            <input type="number" name="maxParticipants" placeholder="Max Participants" value={formData.maxParticipants} onChange={handleChange} />
            <select name="mode" value={formData.mode} onChange={handleChange}>
              <option>Offline</option>
              <option>Online</option>
              <option>Hybrid</option>
            </select>
            <input name="venue" placeholder="Venue" value={formData.venue} onChange={handleChange} />
            <input name="budget" placeholder="Budget Description" value={formData.budget} onChange={handleChange} />
            <input type="number" name="budgetAmount" placeholder="Budget Amount" value={formData.budgetAmount} onChange={handleChange} />
            <div className="form-actions">
              <button type="submit">{editingEventId ? 'Update Event' : 'Submit Event'}</button>
              {editingEventId && <button type="button" onClick={cancelEdit}>Cancel</button>}
            </div>
          </form>

          <h3>My Proposed Events</h3>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Approval</th>
                <th>Edit</th>
              </tr>
            </thead>
            <tbody>
              {myEvents.map((event) => (
                <tr key={event._id}>
                  <td>{event.title}</td>
                  <td>{event.approvalStatus}</td>
                  <td>
                    {event.approvalStatus === 'Pending' ? (
                      <button onClick={() => handleEdit(event)}>Edit</button>
                    ) : (
                      'Locked'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {activeTab === 'categories' && (
        <>
          <h3>Request a New Category</h3>
          <form className="event-form" onSubmit={handleCategorySubmit}>
            <input name="name" placeholder="Category Name" required value={categoryRequest.name} onChange={handleCategoryRequestChange} />
            <textarea name="description" placeholder="Description" value={categoryRequest.description} onChange={handleCategoryRequestChange} />
            <div className="form-actions">
              <button type="submit">Request Category</button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default ModeratorDashboard;
