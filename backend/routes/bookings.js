const express = require('express');
const Booking = require('../models/Booking');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const BookingService = require('../services/bookingService');

const router = express.Router();

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { resourceId, date, slotNumber } = req.body;
    const userId = req.user._id;

    // Validation
    if (!resourceId || !date || !slotNumber) {
      return res.status(400).json({ message: 'Resource ID, date, and slot number are required' });
    }

    if (slotNumber < 1 || slotNumber > 8) {
      return res.status(400).json({ message: 'Slot number must be between 1 and 8' });
    }

    // Validate date is not in the past
    const bookingDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (bookingDate < today) {
      return res.status(400).json({ message: 'Cannot book for past dates' });
    }

    const result = await BookingService.createBooking(
      userId, 
      resourceId, 
      date, 
      slotNumber, 
      req.io
    );

    res.status(201).json({
      message: result.message,
      booking: result.booking
    });

  } catch (error) {
    console.error('Create booking error:', error);
    
    if (error.message.includes('already have a booking') || 
        error.message.includes('can only book') ||
        error.message.includes('not found') ||
        error.message.includes('Cannot book')) {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Server error creating booking' });
  }
});

// @route   GET /api/bookings/my
// @desc    Get current user's bookings
// @access  Private
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const { includePast = 'false' } = req.query;
    const userId = req.user._id;

    const bookings = await BookingService.getUserBookings(userId, includePast === 'true');

    res.json({
      bookings,
      count: bookings.length
    });

  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ message: 'Server error retrieving bookings' });
  }
});

// @route   DELETE /api/bookings/:id
// @desc    Cancel a booking
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user._id;

    const result = await BookingService.cancelBooking(bookingId, userId, req.io);

    res.json({
      message: result.message,
      cancelledBooking: result.cancelledBooking,
      promotedBooking: result.promotedBooking
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    
    if (error.message.includes('not found') || 
        error.message.includes('Unauthorized') ||
        error.message.includes('already cancelled')) {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Server error cancelling booking' });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get single booking details
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'username email')
      .populate('resourceId', 'name capacity');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns this booking or is admin
    if (booking.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to view this booking' });
    }

    res.json({ booking });

  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ message: 'Server error retrieving booking' });
  }
});

// @route   GET /api/bookings/slot/:resourceId/:date/:slotNumber
// @desc    Get all bookings for a specific slot (admin)
// @access  Admin only
router.get('/slot/:resourceId/:date/:slotNumber', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { resourceId, date, slotNumber } = req.params;

    const bookings = await Booking.find({
      resourceId,
      date: new Date(date),
      slotNumber,
      status: { $ne: 'cancelled' }
    })
    .populate('userId', 'username email')
    .populate('resourceId', 'name capacity')
    .sort({ status: 1, waitlistPosition: 1, createdAt: 1 });

    res.json({
      bookings,
      count: bookings.length,
      confirmedCount: bookings.filter(b => b.status === 'confirmed').length,
      waitlistCount: bookings.filter(b => b.status === 'waitlist').length
    });

  } catch (error) {
    console.error('Get slot bookings error:', error);
    res.status(500).json({ message: 'Server error retrieving slot bookings' });
  }
});

// @route   GET /api/bookings/stats
// @desc    Get booking statistics (admin)
// @access  Admin only
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { resourceId, startDate, endDate } = req.query;

    const stats = await BookingService.getBookingStats(resourceId, startDate, endDate);

    res.json({ stats });

  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({ message: 'Server error retrieving booking statistics' });
  }
});

// @route   GET /api/bookings/availability/:resourceId/:date/:slotNumber
// @desc    Check slot availability
// @access  Private
router.get('/availability/:resourceId/:date/:slotNumber', authMiddleware, async (req, res) => {
  try {
    const { resourceId, date, slotNumber } = req.params;
    const userId = req.user._id;

    // Get resource capacity
    const Resource = require('../models/Resource');
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Count confirmed bookings
    const confirmedCount = await Booking.countDocuments({
      resourceId,
      date: new Date(date),
      slotNumber,
      status: 'confirmed'
    });

    // Count waitlist bookings
    const waitlistCount = await Booking.countDocuments({
      resourceId,
      date: new Date(date),
      slotNumber,
      status: 'waitlist'
    });

    // Check if user has existing booking
    const userBooking = await Booking.findOne({
      userId,
      resourceId,
      date: new Date(date),
      slotNumber,
      status: { $ne: 'cancelled' }
    });

    // Check concurrent booking limit
    const canBookMore = await BookingService.checkConcurrentBookingLimit(userId, date, slotNumber);

    const availability = {
      resourceId,
      date,
      slotNumber,
      capacity: resource.capacity,
      confirmedBookings: confirmedCount,
      waitlistBookings: waitlistCount,
      availableSpots: Math.max(0, resource.capacity - confirmedCount),
      isAvailable: confirmedCount < resource.capacity,
      userBooking: userBooking ? {
        id: userBooking._id,
        status: userBooking.status,
        waitlistPosition: userBooking.waitlistPosition
      } : null,
      canBookMore,
      slotTime: {
        1: '8:00 AM - 10:00 AM',
        2: '10:00 AM - 12:00 PM',
        3: '12:00 PM - 2:00 PM',
        4: '2:00 PM - 4:00 PM',
        5: '4:00 PM - 6:00 PM',
        6: '6:00 PM - 8:00 PM',
        7: '8:00 PM - 10:00 PM',
        8: '10:00 PM - 12:00 AM'
      }[slotNumber]
    };

    res.json(availability);

  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({ message: 'Server error checking availability' });
  }
});

module.exports = router;

