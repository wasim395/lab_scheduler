const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource',
    required: [true, 'Resource ID is required']
  },
  date: {
    type: Date,
    required: [true, 'Booking date is required'],
    validate: {
      validator: function(date) {
        // Ensure date is not in the past (except for today)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date >= today;
      },
      message: 'Cannot book for past dates'
    }
  },
  slotNumber: {
    type: Number,
    required: [true, 'Slot number is required'],
    min: [1, 'Slot number must be between 1 and 8'],
    max: [8, 'Slot number must be between 1 and 8']
  },
  status: {
    type: String,
    enum: ['confirmed', 'waitlist', 'cancelled'],
    default: 'confirmed'
  },
  waitlistPosition: {
    type: Number,
    min: [1, 'Waitlist position must be at least 1'],
    default: null
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
bookingSchema.index({ resourceId: 1, date: 1, slotNumber: 1, status: 1 });
bookingSchema.index({ userId: 1, date: 1 });
bookingSchema.index({ userId: 1, resourceId: 1, date: 1, slotNumber: 1 });

// Unique constraint: One user can't book same resource+date+slot twice
bookingSchema.index(
  { userId: 1, resourceId: 1, date: 1, slotNumber: 1 },
  { unique: true, partialFilterExpression: { status: { $ne: 'cancelled' } } }
);

// Virtual for slot time display
bookingSchema.virtual('slotTime').get(function() {
  const slotTimes = {
    1: '8:00 AM - 10:00 AM',
    2: '10:00 AM - 12:00 PM',
    3: '12:00 PM - 2:00 PM',
    4: '2:00 PM - 4:00 PM',
    5: '4:00 PM - 6:00 PM',
    6: '6:00 PM - 8:00 PM',
    7: '8:00 PM - 10:00 PM',
    8: '10:00 PM - 12:00 AM'
  };
  return slotTimes[this.slotNumber];
});

// Ensure virtual fields are serialized
bookingSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Booking', bookingSchema);

