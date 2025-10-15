const jwt = require('jsonwebtoken');
const User = require('../models/User');

const setupSocketHandlers = (io) => {
  // Authentication middleware for Socket.io
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('Authentication error: Invalid token'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.username} connected with socket ID: ${socket.id}`);

    // Join user-specific room for personal notifications
    socket.join(`user_${socket.userId}`);

    // Handle joining resource-specific rooms
    socket.on('join-resource', (resourceId) => {
      socket.join(`resource_${resourceId}`);
      console.log(`User ${socket.user.username} joined resource room: ${resourceId}`);
    });

    // Handle leaving resource-specific rooms
    socket.on('leave-resource', (resourceId) => {
      socket.leave(`resource_${resourceId}`);
      console.log(`User ${socket.user.username} left resource room: ${resourceId}`);
    });

    // Handle joining slot-specific rooms for granular updates
    socket.on('join-slot', (data) => {
      const { resourceId, date, slotNumber } = data;
      const roomName = `slot_${resourceId}_${date}_${slotNumber}`;
      socket.join(roomName);
      console.log(`User ${socket.user.username} joined slot room: ${roomName}`);
    });

    // Handle leaving slot-specific rooms
    socket.on('leave-slot', (data) => {
      const { resourceId, date, slotNumber } = data;
      const roomName = `slot_${resourceId}_${date}_${slotNumber}`;
      socket.leave(roomName);
      console.log(`User ${socket.user.username} left slot room: ${roomName}`);
    });

    // Handle admin joining admin room
    if (socket.user.role === 'admin') {
      socket.join('admin');
      console.log(`Admin ${socket.user.username} joined admin room`);
    }

    // Handle booking updates (for real-time schedule updates)
    socket.on('subscribe-booking-updates', (data) => {
      const { resourceId, date, slotNumber } = data;
      const roomName = `slot_${resourceId}_${date}_${slotNumber}`;
      socket.join(roomName);
      console.log(`User ${socket.user.username} subscribed to booking updates for slot: ${roomName}`);
    });

    // Handle unsubscribing from booking updates
    socket.on('unsubscribe-booking-updates', (data) => {
      const { resourceId, date, slotNumber } = data;
      const roomName = `slot_${resourceId}_${date}_${slotNumber}`;
      socket.leave(roomName);
      console.log(`User ${socket.user.username} unsubscribed from booking updates for slot: ${roomName}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User ${socket.user.username} disconnected`);
    });

    // Send welcome message to user
    socket.emit('connected', {
      message: 'Connected to Lab Resource Scheduler',
      user: {
        id: socket.user._id,
        username: socket.user.username,
        role: socket.user.role
      }
    });
  });

  // Utility functions for emitting events from other parts of the application
  const emitBookingCreated = (resourceId, date, slotNumber, booking) => {
    const roomName = `slot_${resourceId}_${date}_${slotNumber}`;
    io.to(roomName).emit('booking-created', {
      resourceId,
      date,
      slotNumber,
      booking
    });
    
    // Also emit to resource room for broader updates
    io.to(`resource_${resourceId}`).emit('booking-created', {
      resourceId,
      date,
      slotNumber,
      booking
    });
  };

  const emitBookingCancelled = (resourceId, date, slotNumber, cancelledBooking, promotedBooking) => {
    const roomName = `slot_${resourceId}_${date}_${slotNumber}`;
    
    // Emit to slot room
    io.to(roomName).emit('booking-cancelled', {
      resourceId,
      date,
      slotNumber,
      cancelledBooking,
      promotedBooking
    });
    
    // Emit to resource room
    io.to(`resource_${resourceId}`).emit('booking-cancelled', {
      resourceId,
      date,
      slotNumber,
      cancelledBooking,
      promotedBooking
    });

    // Notify promoted user specifically
    if (promotedBooking) {
      io.to(`user_${promotedBooking.userId._id}`).emit('waitlist-promoted', {
        booking: promotedBooking,
        message: 'Congratulations! You have been promoted from waitlist to confirmed booking.',
        resourceId,
        date,
        slotNumber
      });
    }
  };

  const emitSlotAvailabilityChanged = (resourceId, date, slotNumber, availability) => {
    const roomName = `slot_${resourceId}_${date}_${slotNumber}`;
    io.to(roomName).emit('slot-availability-changed', {
      resourceId,
      date,
      slotNumber,
      availability
    });
  };

  const emitResourceUpdated = (resourceId, resource) => {
    io.to(`resource_${resourceId}`).emit('resource-updated', {
      resourceId,
      resource
    });
    
    // Also notify admin room
    io.to('admin').emit('resource-updated', {
      resourceId,
      resource
    });
  };

  const emitSystemNotification = (message, type = 'info', targetUsers = null) => {
    if (targetUsers) {
      // Send to specific users
      targetUsers.forEach(userId => {
        io.to(`user_${userId}`).emit('system-notification', {
          message,
          type,
          timestamp: new Date()
        });
      });
    } else {
      // Send to all connected users
      io.emit('system-notification', {
        message,
        type,
        timestamp: new Date()
      });
    }
  };

  // Make utility functions available globally
  io.emitBookingCreated = emitBookingCreated;
  io.emitBookingCancelled = emitBookingCancelled;
  io.emitSlotAvailabilityChanged = emitSlotAvailabilityChanged;
  io.emitResourceUpdated = emitResourceUpdated;
  io.emitSystemNotification = emitSystemNotification;

  console.log('Socket.io handlers setup complete');
};

module.exports = { setupSocketHandlers };

