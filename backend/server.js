require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const natural = require('natural');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
    }).then(() => console.log("Connected to Database"))
    .catch(err => console.error("Database connection error:", err));

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    gender: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    state: { type: String, required: true },
    nationality: { type: String, required: true },
    profession: { type: String, required: true },
    residenceType: { type: String, required: true },
    role: {
    type: String,
    enum: [
        "Admin",
        "Moderator",
        "Member",
        "User",
    ],
    default: "User",
    required: true,
    },
    interests: [{ type: String}],
    createdAt: { type: Date, default: Date.now },
});
const User = mongoose.model('User', userSchema);

app.use(cors("*"));
app.use(bodyParser.json());

app.post('/auth/signup', async (req, res) => {
    const {name,email,password,gender,phoneNumber,state,nationality,profession,residenceType,interests} = req.body;

    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'Email Already in Use' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({name,email,password: hashedPassword,gender,phoneNumber,state,nationality,profession,residenceType,interests});
    await newUser.save();
    res.status(200).json({ message: 'User Created Successfully' });
});

app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password); 
    if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

    const token = jwt.sign({ user: user}, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token, message: "Login Successful" }); 
})

app.post('/auth/filterbyrole', async (req, res) => {
    const {role} = req.body;
    const users = await User.find({role: role});
    res.status(200).json({users}); 
})

app.post('/auth/assignrole', async (req, res) => {
    const {email,role} = req.body;
    const user = await User.findOne({ email });
    user.role = role;
    await user.save();
    res.status(200).json({message: "Role Assigned Successfully"}); 
})

app.post('/auth/edituser', async (req, res) => {
    const {email} = req.body;
    const user = await User.findOne({ email });
    res.status(200).json({user});
});

app.post('/auth/saveuser', async (req, res) => {
    const { name, email, gender, phoneNumber, state, nationality, profession, residenceType, interests } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = name;
    user.gender = gender;
    user.phoneNumber = phoneNumber;
    user.state = state;
    user.nationality = nationality;
    user.profession = profession;
    user.residenceType = residenceType;
    user.interests = interests;

    await user.save();
    res.status(200).json({ message: 'User Updated Successfully' });
});

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true, maxlength: 500 },
  category: { type: String, required: true },
  startDate: { type: Date, required: true },
  regStartDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  regEndDate: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  numberOfDays: { type: Number, required: true },
  maxParticipants: { type: Number, required: true },
  mode: { type: String, required: true, enum: ["Online", "Offline", "Hybrid"] },
  venue: { type: String, required: true },
  budget: { type: String, required: true },
  budgetAmount: { type: Number, default: 0 },
  tags: [{ type: String }],
  proposedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  approvalStatus: {
    type: String,
    default: "Pending",
    enum: ["Pending", "Approved", "Rejected"],
  },
  status: {
    type: String,
    default: "Upcoming",
    enum: ["Upcoming", "Completed", "Freezed"],
  },
  statusUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  remarks: { type: String, default: "" },
  summary: { type: String, default: "" },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  certificate: { type: Boolean, required: true, default: false },
});
const Event = mongoose.model("Event", eventSchema);

app.post('/event/create', async (req, res) => {
    try {
      const {
        title, description, category, startDate, endDate,
        startTime, endTime, numberOfDays, maxParticipants,
        mode, venue, budget, budgetAmount, proposedBy, certificate
      } = req.body;
  
      const regStartDate = new Date();
      const regEndDate = new Date(endDate);
      regEndDate.setDate(regEndDate.getDate() - 1);
  
      const newEvent = new Event({
        title,
        description,
        category,
        startDate,
        regStartDate,
        endDate,
        regEndDate,
        startTime,
        endTime,
        numberOfDays,
        maxParticipants,
        mode,
        venue,
        budget,
        budgetAmount,
        proposedBy,
        certificate
      });
  
      await newEvent.save();
      res.status(201).json({ message: 'Event created successfully'});
    } catch (error) {
      res.status(500).json({ message: 'Error creating event', error: error.message });
    }
  });

  app.post('/event/edit', async (req, res) => {
    try {
        const {eventid,title, description, category, startDate, endDate,
            startTime, endTime, numberOfDays, maxParticipants,
            mode, venue, budget, budgetAmount, proposedBy, certificate
          } = req.body;
        const event = await Event.findById(eventid);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        
    
        event.title = title || event.title;
        event.description = description || event.description;
        event.category = category || event.category;
        event.startDate = startDate || event.startDate;
        event.endDate = endDate || event.endDate;
        event.startTime = startTime || event.startTime;
        event.endTime = endTime || event.endTime;
        event.numberOfDays = numberOfDays || event.numberOfDays;
        event.maxParticipants = maxParticipants || event.maxParticipants;
        event.mode = mode || event.mode;
        event.venue = venue || event.venue;
        event.budget = budget || event.budget;
        event.budgetAmount = budgetAmount || event.budgetAmount;
        event.proposedBy = proposedBy || event.proposedBy;
        event.certificate = certificate || event.certificate;
        const regStartDate = new Date();
        const regEndDate = new Date(endDate);
        regEndDate.setDate(regEndDate.getDate() - 1);
        event.regStartDate = regStartDate || event.regStartDate;
        event.regEndDate = regEndDate || event.regEndDate;
        event.updatedAt = new Date();

        await event.save();
        res.status(200).json({ message: 'Event updated successfully', event });
    } catch (error) {
        res.status(500).json({ message: 'Error updating event', error: error.message });
    }
  });

  app.delete('/event/delete', async (req, res) => {
    try {
        const { eventid } = req.body;
        const deleted = await Event.findByIdAndDelete(eventid);
        if (!deleted) return res.status(404).json({ message: 'Event not found' });
    
        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting event', error: error.message });
    }
  });

  app.post('/event/approve', async (req, res) => {
    const {
      eventid,
      title,
      description,
      category,
      startDate,
      endDate,
      startTime,
      endTime,
      regStartDate,
      regEndDate,
      numberOfDays,
      maxParticipants,
      mode,
      venue,
      budget,
      budgetAmount,
      certificate,
      status,
      approvalStatus,
      remarks,
      statusUpdatedBy
    } = req.body;
  
    if (!eventid || !approvalStatus || !statusUpdatedBy) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
  
    try {
      const event = await Event.findById(eventid);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
  
      event.title = title;
      event.description = description;
      event.category = category;
      event.startDate = startDate;
      event.endDate = endDate;
      event.startTime = startTime;
      event.endTime = endTime;
      event.regStartDate = regStartDate;
      event.regEndDate = regEndDate;
      event.numberOfDays = numberOfDays;
      event.maxParticipants = maxParticipants;
      event.mode = mode;
      event.venue = venue;
      event.budget = budget;
      event.budgetAmount = budgetAmount;
      event.certificate = certificate;
      event.status = status;
      event.approvalStatus = approvalStatus;
      event.remarks = remarks;
      event.statusUpdatedBy = statusUpdatedBy;
      event.updatedAt = new Date();
  
      await event.save();
  
      res.status(200).json({
        message: `Event ${approvalStatus.toLowerCase()} successfully`,
        event
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error updating event',
        error: error.message
      });
    }
  });
  

  app.post('/event/filterby', async (req, res) => {
    try {
      const filters = {};
      const {
        status,
        startDate,
        endDate,
        venue,
        mode,
        category,
        title,
        approvalStatus,
        proposedBy,
        certificate,
      } = req.body;
  
      if (status) filters.status = status;
      if (startDate) filters.startDate = { $gte: new Date(startDate) };
      if (endDate) filters.endDate = { $lte: new Date(endDate) };
      if (venue) filters.venue = { $regex: new RegExp(venue, 'i') };
      if (mode) filters.mode = mode;
      if (category) filters.category = category;
      if (title) filters.title = { $regex: new RegExp(title, 'i') };
      if (approvalStatus) filters.approvalStatus = approvalStatus;
      if (proposedBy) filters.proposedBy = proposedBy;
      if (typeof certificate === "boolean") filters.certificate = certificate;
  
      const events = await Event.find(filters)
        .populate("proposedBy statusUpdatedBy participants");
  
      res.status(200).json({ message: "Filtered events fetched successfully", events });
    } catch (error) {
      res.status(500).json({ message: "Error fetching filtered events", error: error.message });
    }
  });
  
  app.get('/event/all', async (req, res) => {
    try {
        const events = await Event.find()
            .populate("proposedBy statusUpdatedBy participants")
            .sort({ startDate: 1 });
        res.status(200).json({ message: 'All events fetched successfully', events });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching events', error: error.message });
    }
})

app.post('/event/register', async (req, res) => {
    try {
      const { userId, eventId } = req.body;
  
      const event = await Event.findById(eventId);
      if (!event) return res.status(404).json({ message: 'Event not found' });
  
      const alreadyRegistered = event.participants.includes(userId);
      if (alreadyRegistered) return res.status(400).json({ message: 'User already registered' });
      
      event.participants.push(userId);
  
      await event.save();
      res.status(200).json({ message: 'User registered successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error registering user', error: error.message });
    }
  });
  
  app.post('/event/deregister', async (req, res) => {
    try {
      const { userId, eventId } = req.body;
  
      const event = await Event.findById(eventId);
      if (!event) return res.status(404).json({ message: 'Event not found' });
  
      const now = new Date();
      const startTime = new Date(event.startDate);
      const diffInHours = (startTime - now) / (1000 * 60 * 60);
  
      if (diffInHours <= 6) {
        return res.status(400).json({ message: 'Cannot deregister within 6 hours of event start' });
      }
  
      event.participants = event.participants.filter(id => id.toString() !== userId);
      await event.save();
  
      res.status(200).json({ message: 'Deregistered successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deregistering user', error: error.message });
    }
  });

  const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    status: {
      type: String,
      enum: ['Approved', 'Pending'],
      default: 'Pending'
    },
  });
  const Category = mongoose.model('Category', categorySchema);

    app.post('/category/create', async (req, res) => {
    try {
        const { name, description } = req.body;
        const category = new Category({ name, description });
        await category.save();
        res.status(201).json({ message: 'Category created (pending approval)', category });
    } catch (err) {
        res.status(400).json({ message: 'Error creating category', error: err.message });
    }
    });

    app.get('/category/approved', async (req, res) => {
    try {
        const categories = await Category.find({ status: 'Approved' });
        res.status(200).json({ categories });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching categories' });
    }
    });
    app.get('/category/all', async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json({ categories });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching all categories' });
    }
    });

    app.post('/category/approve', async (req, res) => {
    try {
        const { categoryId } = req.body;
        const category = await Category.findByIdAndUpdate(categoryId, { status: 'Approved' }, { new: true });
        res.status(200).json({ message: 'Category approved', category });
    } catch (err) {
        res.status(400).json({ message: 'Error approving category', error: err.message });
    }
    });

    app.delete('/category/delete/:id', async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Category deleted' });
    } catch (err) {
        res.status(400).json({ message: 'Error deleting category', error: err.message });
    }
    });


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});