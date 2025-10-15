const Booking = require('../models/Booking');
const Resource = require('../models/Resource');
const SystemSettings = require('../models/SystemSettings');

class BookingService {
  // Get maximum concurrent bookings setting (default: 3)
  static async getMaxConcurrentBookings() {
    try {
      const setting = await SystemSettings.findOne({ key: 'maxConcurrentBookings' });
      return setting ? setting.value : 3;
    } catch (error) {
      console.error('Error getting max concurrent bookings:', error);
      return 3; // Default fallback
    }
  }

  // Check if user has reached max concurrent bookings for same date+slot
  static async checkConcurrentBookingLimit(userId, date, slotNumber) {
    try {
      const maxConcurrent = await this.getMaxConcurrentBookings();
      
      const concurrentBookings = await Booking.countDocuments({
        userId,
        date: new Date(date),
        slotNumber,
        status: { $in: ['confirmed', 'waitlist'] }
      });

      return concurrentBookings < maxConcurrent;
    } catch (error) {
      console.error('Error checking concurrent booking limit:', error);
      return false;
    }
  }

  // Create a new booking
  static async createBooking(userId, resourceId, date, slotNumber, io = null) {
    try {
      // Validate inputs
      if (!userId || !resourceId || !date || !slotNumber) {
        throw new Error('Missing required booking parameters');
      }

      // Check if resource exists and is active
      const resource = await Resource.findById(resourceId);
      if (!resource || !resource.isActive) {
        throw new Error('Resource not found or inactive');
      }

      // Check concurrent booking limit
      const canBook = await this.checkConcurrentBookingLimit(userId, date, slotNumber);
      if (!canBook) {
        const maxConcurrent = await this.getMaxConcurrentBookings();
        throw new Error(`You can only book ${maxConcurrent} different resources for the same time slot`);
      }

      // Check if user already has a booking for this exact slot
      const existingBooking = await Booking.findOne({
        userId,
        resourceId,
        date: new Date(date),
        slotNumber,
        status: { $ne: 'cancelled' }
      });

      if (existingBooking) {
        throw new Error('You already have a booking for this time slot');
      }

      // Count current confirmed bookings for this slot
      const confirmedCount = await Booking.countDocuments({
        resourceId,
        date: new Date(date),
        slotNumber,
        status: 'confirmed'
      });

      // Determine booking status
      let status, waitlistPosition = null;

      if (confirmedCount < resource.capacity) {
        // Slot has capacity - confirmed booking
        status = 'confirmed';
      } else {
        // Slot is full - add to waitlist
        status = 'waitlist';
        waitlistPosition = await this.getNextWaitlistPosition(resourceId, date, slotNumber);
      }

      // Create the booking
      const booking = new Booking({
        userId,
        resourceId,
        date: new Date(date),
        slotNumber,
        status,
        waitlistPosition
      });

      await booking.save();

      // Populate user info for response
      await booking.populate('userId', 'username email');

      // Emit WebSocket event for real-time updates
      if (io) {
        io.to(`resource_${resourceId}`).emit('booking-created', {
          resourceId,
          date,
          slotNumber,
          booking: booking
        });
      }

      return {
        booking,
        message: status === 'confirmed' 
          ? 'Booking confirmed successfully!' 
          : `Added to waitlist at position ${waitlistPosition}`
      };

    } catch (error) {
      console.error('Create booking error:', error);
      throw error;
    }
  }

  // Cancel a booking and promote next waitlist user
  static async cancelBooking(bookingId, userId, io = null) {
    try {
      // Find the booking
      const booking = await Booking.findById(bookingId).populate('userId', 'username email');
      
      if (!booking) {
        throw new Error('Booking not found');
      }

      // Check if user owns this booking (or is admin)
      if (booking.userId._id.toString() !== userId.toString()) {
        throw new Error('Unauthorized to cancel this booking');
      }

      // Check if booking is already cancelled
      if (booking.status === 'cancelled') {
        throw new Error('Booking is already cancelled');
      }

      const originalStatus = booking.status;
      const { resourceId, date, slotNumber, waitlistPosition } = booking;

      // Mark booking as cancelled
      booking.status = 'cancelled';
      booking.waitlistPosition = null;
      await booking.save();

      let promotedBooking = null;

      // If it was a confirmed booking, try to promote someone from waitlist
      if (originalStatus === 'confirmed') {
        promotedBooking = await this.promoteNextWaitlistUser(resourceId, date, slotNumber, io);
      } else if (originalStatus === 'waitlist') {
        // If it was a waitlist booking, renumber remaining waitlist positions
        await this.renumberWaitlistPositions(resourceId, date, slotNumber, waitlistPosition);
      }

      // Emit WebSocket events
      if (io) {
        io.to(`resource_${resourceId}`).emit('booking-cancelled', {
          resourceId,
          date,
          slotNumber,
          cancelledBooking: booking,
          promotedBooking
        });

        // Notify the promoted user specifically
        if (promotedBooking) {
          io.to(`user_${promotedBooking.userId._id}`).emit('waitlist-promoted', {
            booking: promotedBooking,
            message: 'Congratulations! You have been promoted from waitlist to confirmed booking.'
          });
        }
      }

      return {
        cancelledBooking: booking,
        promotedBooking,
        message: 'Booking cancelled successfully'
      };

    } catch (error) {
      console.error('Cancel booking error:', error);
      throw error;
    }
  }

  // Promote the next user from waitlist to confirmed
  static async promoteNextWaitlistUser(resourceId, date, slotNumber, io = null) {
    try {
      // Find the first person on waitlist (lowest position, earliest created)
      const nextWaitlistBooking = await Booking.findOne({
        resourceId,
        date: new Date(date),
        slotNumber,
        status: 'waitlist'
      })
      .sort({ waitlistPosition: 1, createdAt: 1 })
      .populate('userId', 'username email');

      if (!nextWaitlistBooking) {
        return null; // No one on waitlist
      }

      // Promote to confirmed
      nextWaitlistBooking.status = 'confirmed';
      nextWaitlistBooking.waitlistPosition = null;
      await nextWaitlistBooking.save();

      // Renumber remaining waitlist positions
      await this.renumberWaitlistPositions(resourceId, date, slotNumber, null);

      return nextWaitlistBooking;

    } catch (error) {
      console.error('Promote waitlist user error:', error);
      throw error;
    }
  }

  // Renumber waitlist positions after a cancellation or promotion
  static async renumberWaitlistPositions(resourceId, date, slotNumber, removedPosition) {
    try {
      const waitlistBookings = await Booking.find({
        resourceId,
        date: new Date(date),
        slotNumber,
        status: 'waitlist'
      }).sort({ waitlistPosition: 1, createdAt: 1 });

      // Renumber positions
      for (let i = 0; i < waitlistBookings.length; i++) {
        const newPosition = i + 1;
        if (waitlistBookings[i].waitlistPosition !== newPosition) {
          waitlistBookings[i].waitlistPosition = newPosition;
          await waitlistBookings[i].save();
        }
      }

    } catch (error) {
      console.error('Renumber waitlist positions error:', error);
      throw error;
    }
  }

  // Get next waitlist position for a slot
  static async getNextWaitlistPosition(resourceId, date, slotNumber) {
    try {
      const lastWaitlistBooking = await Booking.findOne({
        resourceId,
        date: new Date(date),
        slotNumber,
        status: 'waitlist'
      })
      .sort({ waitlistPosition: -1 });

      return lastWaitlistBooking ? lastWaitlistBooking.waitlistPosition + 1 : 1;
    } catch (error) {
      console.error('Get next waitlist position error:', error);
      return 1; // Default fallback
    }
  }

  // Get user's bookings
  static async getUserBookings(userId, includePast = false) {
    try {
      const query = { userId, status: { $ne: 'cancelled' } };
      
      if (!includePast) {
        query.date = { $gte: new Date() };
      }

      const bookings = await Booking.find(query)
        .populate('resourceId', 'name capacity')
        .populate('userId', 'username email')
        .sort({ date: 1, slotNumber: 1 });

      return bookings;
    } catch (error) {
      console.error('Get user bookings error:', error);
      throw error;
    }
  }

  // Get booking statistics for admin
  static async getBookingStats(resourceId = null, startDate = null, endDate = null) {
    try {
      const query = { status: { $ne: 'cancelled' } };
      
      if (resourceId) query.resourceId = resourceId;
      if (startDate && endDate) {
        query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
      }

      const stats = await Booking.aggregate([
        { $match: query },
        {
          $group: {
            _id: {
              resourceId: '$resourceId',
              date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
              slotNumber: '$slotNumber',
              status: '$status'
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: '$_id.resourceId',
            totalBookings: { $sum: '$count' },
            confirmedBookings: {
              $sum: { $cond: [{ $eq: ['$_id.status', 'confirmed'] }, '$count', 0] }
            },
            waitlistBookings: {
              $sum: { $cond: [{ $eq: ['$_id.status', 'waitlist'] }, '$count', 0] }
            }
          }
        }
      ]);

      return stats;
    } catch (error) {
      console.error('Get booking stats error:', error);
      throw error;
    }
  }
}

module.exports = BookingService;

