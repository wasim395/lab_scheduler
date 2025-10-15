const express = require('express');
const Resource = require('../models/Resource');
const Booking = require('../models/Booking');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

// @route   GET /api/resources
// @desc    Get all resources
// @access  Public (authenticated)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const resources = await Resource.find({ isActive: true }).sort({ name: 1 });
    res.json(resources);
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/resources/:id
// @desc    Get single resource
// @access  Public (authenticated)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    res.json(resource);
  } catch (error) {
    console.error('Get resource error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/resources
// @desc    Create new resource
// @access  Admin only
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, description, capacity } = req.body;

    // Validation
    if (!name || !capacity) {
      return res.status(400).json({ message: 'Name and capacity are required' });
    }

    if (capacity < 1 || capacity > 50) {
      return res.status(400).json({ message: 'Capacity must be between 1 and 50' });
    }

    // Check if resource with same name exists
    const existingResource = await Resource.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      isActive: true
    });

    if (existingResource) {
      return res.status(400).json({ message: 'Resource with this name already exists' });
    }

    const resource = new Resource({
      name,
      description: description || '',
      capacity
    });

    await resource.save();

    res.status(201).json({
      message: 'Resource created successfully',
      resource
    });
  } catch (error) {
    console.error('Create resource error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/resources/:id
// @desc    Update resource
// @access  Admin only
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, description, capacity } = req.body;

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Validation
    if (capacity && (capacity < 1 || capacity > 50)) {
      return res.status(400).json({ message: 'Capacity must be between 1 and 50' });
    }

    // Check if new name conflicts with existing resources
    if (name && name !== resource.name) {
      const existingResource = await Resource.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        isActive: true,
        _id: { $ne: req.params.id }
      });

      if (existingResource) {
        return res.status(400).json({ message: 'Resource with this name already exists' });
      }
    }

    // Update fields
    if (name) resource.name = name;
    if (description !== undefined) resource.description = description;
    if (capacity) resource.capacity = capacity;

    await resource.save();

    res.json({
      message: 'Resource updated successfully',
      resource
    });
  } catch (error) {
    console.error('Update resource error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/resources/:id
// @desc    Delete resource (soft delete)
// @access  Admin only
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Check if there are any active bookings for this resource
    const activeBookings = await Booking.countDocuments({
      resourceId: req.params.id,
      status: { $in: ['confirmed', 'waitlist'] }
    });

    if (activeBookings > 0) {
      return res.status(400).json({ 
        message: `Cannot delete resource. There are ${activeBookings} active bookings. Please cancel all bookings first.`
      });
    }

    // Soft delete
    resource.isActive = false;
    await resource.save();

    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Delete resource error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/resources/:id/schedule
// @desc    Get resource schedule for date range
// @access  Public (authenticated)
router.get('/:id/schedule', authMiddleware, async (req, res) => {
  try {
    const resourceId = req.params.id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Get all bookings for this resource in the date range
    const bookings = await Booking.find({
      resourceId,
      date: { $gte: new Date(startDate), $lte: new Date(endDate) },
      status: { $in: ['confirmed', 'waitlist'] }
    }).populate('userId', 'username email');

    // Group bookings by date and slot
    const scheduleData = {};
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Initialize all dates and slots
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];
      scheduleData[dateStr] = {};
      
      for (let slot = 1; slot <= 8; slot++) {
        scheduleData[dateStr][slot] = {
          slotNumber: slot,
          confirmedBookings: [],
          waitlistBookings: [],
          totalConfirmed: 0,
          totalWaitlist: 0,
          capacity: resource.capacity,
          isAvailable: true,
          userBooking: null
        };
      }
    }

    // Populate with actual bookings
    bookings.forEach(booking => {
      const dateStr = booking.date.toISOString().split('T')[0];
      const slot = booking.slotNumber;
      
      if (scheduleData[dateStr] && scheduleData[dateStr][slot]) {
        if (booking.status === 'confirmed') {
          scheduleData[dateStr][slot].confirmedBookings.push(booking);
          scheduleData[dateStr][slot].totalConfirmed++;
        } else if (booking.status === 'waitlist') {
          scheduleData[dateStr][slot].waitlistBookings.push(booking);
          scheduleData[dateStr][slot].totalWaitlist++;
        }

        // Check if current user has a booking in this slot
        if (booking.userId._id.toString() === req.user._id.toString()) {
          scheduleData[dateStr][slot].userBooking = booking;
        }

        // Check availability
        if (scheduleData[dateStr][slot].totalConfirmed >= resource.capacity) {
          scheduleData[dateStr][slot].isAvailable = false;
        }
      }
    });

    res.json({
      resource,
      schedule: scheduleData,
      slotTimes: {
        1: '8:00 AM - 10:00 AM',
        2: '10:00 AM - 12:00 PM',
        3: '12:00 PM - 2:00 PM',
        4: '2:00 PM - 4:00 PM',
        5: '4:00 PM - 6:00 PM',
        6: '6:00 PM - 8:00 PM',
        7: '8:00 PM - 10:00 PM',
        8: '10:00 PM - 12:00 AM'
      }
    });
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

