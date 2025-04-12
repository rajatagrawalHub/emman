require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const natural = require('natural');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("Connected to Database"))
  .catch(err => console.error("Database connection error:", err));

// Define Schemas & Models
const userSchema = new mongoose.Schema({
  name: String,
  role: { type: String, enum: ['admin', 'user'], default: 'user' }
});
const User = mongoose.model('User', userSchema);

const eventSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  tags: [String],
  date: Date,
  venue: String,
  registeredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});
const Event = mongoose.model('Event', eventSchema);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Middleware to check admin role
async function isAdmin(req, res, next) {
  const { userId } = req.body;
  const user = await User.findById(userId);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

// NLP utilities
function generateTags(text, count = 5) {
  const tokenizer = new natural.WordTokenizer();
  const tfidf = new natural.TfIdf();
  tfidf.addDocument(text);
  const terms = tfidf.listTerms(0).slice(0, count);
  return terms.map(term => term.term);
}

function predictCategory(description) {
  const keywords = {
    "innovation": ["technology", "arduino", "engineering", "project", "hackathon", "prototype"],
    "career": ["mentoring", "career", "guidance", "jobs", "internship", "placement"],
    "education": ["seminar", "lecture", "university", "discussion", "talk", "learning"]
  };

  description = description.toLowerCase();
  for (let category in keywords) {
    if (keywords[category].some(word => description.includes(word))) {
      return category;
    }
  }
  return "general";
}

function predictAttendance(event) {
  let probability = 0.5;
  const day = new Date(event.date).getDay();
  if (day === 0 || day === 6) probability -= 0.1;
  if (event.venue.toLowerCase().includes("online")) probability += 0.2;
  if (event.category === "innovation") probability += 0.1;
  probability = Math.max(0, Math.min(1, probability));
  return Math.round(probability * 100);
}

// ============ Routes ============

// Register User
app.post('/users/register', async (req, res) => {
  const { name, role } = req.body;
  const newUser = new User({ name, role });
  await newUser.save();
  res.json(newUser);
});

// Create Event (Admin only)
app.post('/events/create', async (req, res) => {
  const { title, description, date, venue, category } = req.body;
  const tags = generateTags(description);
  const suggestedCategory = predictCategory(description);

  if (category !== suggestedCategory) {
    return res.json({
      message: 'Category mismatch',
      suggestedCategory,
      tags,
      alert: true
    });
  }

  const event = new Event({
    title,
    description,
    date,
    venue,
    category,
    tags,
    registeredUsers: []
  });

  await event.save();
  res.json({ message: 'Event created', event });
});

// Register for Event
app.post('/events/register', async (req, res) => {
  const { userId, eventId } = req.body;

  const event = await Event.findById(eventId);
  if (!event) return res.status(404).json({ message: 'Event not found' });

  if (!event.registeredUsers.includes(userId)) {
    event.registeredUsers.push(userId);
    await event.save();
  }

  res.json({ message: 'Registered successfully', attendees: event.registeredUsers.length });
});

// Get All Events
app.get('/events/all', async (req, res) => {
  const allEvents = await Event.find().populate('registeredUsers', 'name');
  res.json(allEvents);
});

// NLP Tag Suggestion
app.post('/events/tags', (req, res) => {
  const { description } = req.body;
  const tags = generateTags(description);
  res.json({ tags });
});

// Predict Category
app.post('/events/predictCategory', (req, res) => {
  const { description } = req.body;
  const category = predictCategory(description);
  res.json({ suggestedCategory: category });
});

// Predict Attendance
app.post('/events/predictAttendance', (req, res) => {
  const { event } = req.body;
  const turnout = predictAttendance(event);
  res.json({ expectedTurnoutPercentage: turnout });
});

// Trending Events
app.get('/events/trending', async (req, res) => {
  const events = await Event.find();
  const trending = events
    .map(e => ({ ...e.toObject(), popularity: e.registeredUsers.length }))
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 5);

  res.json(trending);
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
