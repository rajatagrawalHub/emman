import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../App.css';

const AdminDashboard = () => {
  const { token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('users'); // users | events | edit
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [approvalFilter, setApprovalFilter] = useState('All');
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const emptyForm = {
    title: '', description: '', category: '',
    startDate: '', endDate: '', startTime: '', endTime: '',
    regStartDate: '', regEndDate: '', numberOfDays: 1, maxParticipants: 100,
    mode: 'Offline', venue: '', budget: '', budgetAmount: 0,
    certificate: false, status: 'Upcoming', approvalStatus: 'Pending', remarks: ''
  };

  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toISOString().split('T')[0] : '';

  const fetchUsers = async () => {
    try {
      const res = await axios.post('http://localhost:5000/auth/filterbyrole', { role: 'User' });
      setUsers(res.data.users);
    } catch {
      setError('Failed to fetch users');
    }
  };

  const promoteUser = async (email) => {
    try {
      await axios.get('http://localhost:5000/auth/assignrole', {
        data: { email, role: 'Moderator' },
      });
      fetchUsers();
    } catch {
      setError('Failed to promote user');
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/event/all');
      setEvents(res.data.events);
    } catch {
      setError('Failed to fetch events');
    }
  };

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setApprovalFilter(value);
    setFilteredEvents(value === 'All' ? events : events.filter(e => e.approvalStatus === value));
  };

  const handleApproval = async (eventId, status) => {
    try {
      await axios.post('http://localhost:5000/event/approve', {
        eventid: eventId,
        approvalStatus: status,
        statusUpdatedBy: JSON.parse(atob(token.split('.')[1])).user._id,
      });
      setMessage(`Event ${status}`);
      fetchEvents();
    } catch {
      setError('Failed to update event status');
    }
  };

  const handleEditClick = (event) => {
    setEditingEvent(event._id);
    setActiveTab('edit');
    setFormData({
      ...event,
      startDate: formatDate(event.startDate),
      endDate: formatDate(event.endDate),
      regStartDate: formatDate(event.regStartDate),
      regEndDate: formatDate(event.regEndDate)
    });
  };

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/event/approve', {
        ...formData,
        eventid: editingEvent,
        updatedAt: new Date(),
        statusUpdatedBy: JSON.parse(atob(token.split('.')[1])).user._id,
      });
      setMessage('Event updated successfully');
      setEditingEvent(null);
      setFormData(emptyForm);
      setActiveTab('events');
      fetchEvents();
    } catch {
      setError('Failed to update event');
    }
  };

  const cancelEdit = () => {
    setEditingEvent(null);
    setFormData(emptyForm);
    setActiveTab('events');
  };

  useEffect(() => {
    fetchUsers();
    fetchEvents();
  }, []);

  useEffect(() => {
    handleFilterChange({ target: { value: approvalFilter } });
  }, [events]);

  const [categories, setCategories] = useState([]);

const fetchCategories = async () => {
  const res = await axios.get('http://localhost:5000/category/all');
  setCategories(res.data.categories);
};

const approveCategory = async (id) => {
  await axios.post('http://localhost:5000/category/approve', { categoryId: id });
  fetchCategories();
};

const deleteCategory = async (id) => {
  await axios.delete(`http://localhost:5000/category/delete/${id}`);
  fetchCategories();
};

useEffect(() => {
  if (activeTab === 'categories') fetchCategories();
}, [activeTab]);


  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Admin Dashboard</h2>
        <button onClick={logout} className="logout-btn">Logout</button>
      </div>

      {error && <p className="error-message">{error}</p>}
      {message && <p className="success-message">{message}</p>}

      <div className="tab-buttons">
        <button onClick={() => setActiveTab('users')} className={activeTab === 'users' ? 'active' : ''}>Users</button>
        <button onClick={() => setActiveTab('events')} className={activeTab === 'events' ? 'active' : ''}>Events</button>
        <button onClick={() => setActiveTab('categories')} className={activeTab === 'categories' ? 'active' : ''}>Categories</button>
      </div>

      {activeTab === 'users' && (
        <>
          <h3>Users</h3>
          <table>
            <thead>
              <tr><th>Email</th><th>Name</th><th>Promote</th></tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.email}</td>
                  <td>{user.name}</td>
                  <td>
                    <button onClick={() => promoteUser(user.email)}>Promote</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {activeTab === 'events' && (
        <>
          <h3>Events</h3>
          <div className="filter-section">
            <label>Filter by Status:</label>
            <select onChange={handleFilterChange} value={approvalFilter}>
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <table>
            <thead>
              <tr><th>Title</th><th>Proposed By</th><th>Status</th><th>Approval</th><th>Edit</th></tr>
            </thead>
            <tbody>
              {filteredEvents.map((event) => (
                <tr key={event._id}>
                  <td>{event.title}</td>
                  <td>{event.proposedBy?.name || 'N/A'}</td>
                  <td>{event.status}</td>
                  <td>{event.approvalStatus}</td>
                  <td>
                    <button onClick={() => handleEditClick(event)}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {activeTab === 'edit' && (
        <>
          <h3>Edit Event</h3>
          <form className="event-form" onSubmit={handleUpdate}>
            <input name="title" value={formData.title} onChange={handleChange} placeholder="Title" required />
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" required />
            <input name="category" value={formData.category} onChange={handleChange} placeholder="Category" required />
            <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
            <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required />
            <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} required />
            <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} required />
            <input type="date" name="regStartDate" value={formData.regStartDate} onChange={handleChange} />
            <input type="date" name="regEndDate" value={formData.regEndDate} onChange={handleChange} />
            <input type="number" name="numberOfDays" value={formData.numberOfDays} onChange={handleChange} />
            <input type="number" name="maxParticipants" value={formData.maxParticipants} onChange={handleChange} />
            <select name="mode" value={formData.mode} onChange={handleChange}>
              <option>Offline</option>
              <option>Online</option>
              <option>Hybrid</option>
            </select>
            <input name="venue" value={formData.venue} onChange={handleChange} placeholder="Venue" />
            <input name="budget" value={formData.budget} onChange={handleChange} placeholder="Budget Description" />
            <input type="number" name="budgetAmount" value={formData.budgetAmount} onChange={handleChange} />
            <label>
              <input type="checkbox" name="certificate" checked={formData.certificate} onChange={handleChange} />
              Provide Certificate
            </label>
            <textarea name="remarks" value={formData.remarks} onChange={handleChange} placeholder="Remarks" />
            <select name="status" value={formData.status} onChange={handleChange}>
              <option>Upcoming</option>
              <option>Ongoing</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>
            <select name="approvalStatus" value={formData.approvalStatus} onChange={handleChange}>
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
            </select>
            <div className="form-actions">
              <button type="submit">Update</button>
              <button type="button" onClick={cancelEdit}>Cancel</button>
            </div>
          </form>
        </>
      )}

    {activeTab === 'categories' && (
      <>
        <h3>Manage Categories</h3>
        <table>
          <thead>
            <tr><th>Name</th><th>Description</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat._id}>
                <td>{cat.name}</td>
                <td>{cat.description}</td>
                <td>{cat.status}</td>
                <td>
                  {cat.status === 'Pending' && (
                    <button onClick={() => approveCategory(cat._id)}>Approve</button>
                  )}
                  <button onClick={() => deleteCategory(cat._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    )}


    </div>
  );
};

export default AdminDashboard;
