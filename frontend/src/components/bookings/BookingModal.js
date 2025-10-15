import React, { useState } from 'react';
import { format } from 'date-fns';
import { bookingsAPI } from '../../services/api';
import CancelBooking from './CancelBooking';

const BookingModal = ({ resourceId, resourceName, slot, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

  const getSlotTime = (slotNumber) => {
    const times = {
      1: '8:00 AM - 10:00 AM',
      2: '10:00 AM - 12:00 PM',
      3: '12:00 PM - 2:00 PM',
      4: '2:00 PM - 4:00 PM',
      5: '4:00 PM - 6:00 PM',
      6: '6:00 PM - 8:00 PM',
      7: '8:00 PM - 10:00 PM',
      8: '10:00 PM - 12:00 AM'
    };
    return times[slotNumber] || 'Unknown';
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError('');

    try {
      await bookingsAPI.create({
        resourceId,
        date: slot.date,
        slotNumber: slot.slotNumber
      });

      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = () => {
    setShowCancelModal(true);
  };

  const handleCancelConfirm = async () => {
    setLoading(true);
    setError('');

    try {
      const bookingId = userBooking._id || userBooking.id;
      if (!bookingId) {
        throw new Error('Booking ID not found');
      }
      await bookingsAPI.cancel(bookingId);
      setShowCancelModal(false);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to cancel booking');
      setShowCancelModal(false);
      setLoading(false);
    }
  };

  const availability = slot.availability || {};
  const confirmedBookings = availability.confirmedBookings || 0;
  const capacity = availability.capacity || 0;
  const isAvailable = confirmedBookings < capacity;
  const userBooking = availability.userBooking;
  const hasExistingBooking = !!userBooking;

  // Determine slot type: 1) Empty/Available, 2) Full, 3) Already Booked
  const slotType = hasExistingBooking ? 'booked' : (isAvailable ? 'available' : 'full');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="card max-w-md w-full p-8 animate-slide-up">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {slotType === 'booked' ? 'Your Booking' : 'Confirm Booking'}
            </h2>
            <p className="text-gray-400">
              {slotType === 'booked' ? 'Manage your booking' : 'Review your booking details'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="alert alert-error mb-6">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Booking Details */}
        <div className="space-y-4 mb-6">
          <div className="bg-dark-800/50 rounded-lg p-4 border border-dark-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <span className="text-xl">🔬</span>
              </div>
              <div>
                <div className="text-sm text-gray-400">Resource</div>
                <div className="font-semibold text-white">{resourceName}</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-300">
                <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">{format(new Date(slot.date), 'EEEE, MMMM d, yyyy')}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-300">
                <svg className="w-5 h-5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">{getSlotTime(slot.slotNumber)}</span>
              </div>
            </div>
          </div>

          {/* Slot Type 1: Available (Empty) - Show availability info */}
          {slotType === 'available' && (
            <>
              <div className="alert alert-success">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <div className="font-semibold">Slot Available</div>
                  <div className="text-sm">Your booking will be confirmed immediately</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Current Bookings:</span>
                <span className="font-semibold text-white">
                  {confirmedBookings} / {capacity}
                </span>
              </div>
            </>
          )}

          {/* Slot Type 2: Full - Show waitlist warning */}
          {slotType === 'full' && (
            <>
              <div className="alert alert-warning">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <div className="font-semibold">Slot Full - Joining Waitlist</div>
                  <div className="text-sm">
                    You'll be added to the waitlist
                    {availability.waitlistCount > 0 && ` at position #${availability.waitlistCount + 1}`}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Current Bookings:</span>
                <span className="font-semibold text-white">
                  {confirmedBookings} / {capacity}
                </span>
              </div>
              {availability.waitlistCount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">On Waitlist:</span>
                  <span className="font-semibold text-yellow-400">{availability.waitlistCount}</span>
                </div>
              )}
            </>
          )}

          {/* Slot Type 3: Already Booked - Show booking status */}
          {slotType === 'booked' && (
            <>
              {userBooking.status === 'confirmed' ? (
                <div className="alert alert-info">
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="font-semibold">Booking Confirmed</div>
                    <div className="text-sm">You have a confirmed booking for this slot</div>
                  </div>
                </div>
              ) : (
                <div className="alert alert-warning">
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="font-semibold">On Waitlist</div>
                    <div className="text-sm">
                      You're currently at position #{userBooking.waitlistPosition} in the waitlist
                    </div>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Booking Status:</span>
                <span className={`font-semibold ${userBooking.status === 'confirmed' ? 'text-green-400' : 'text-yellow-400'}`}>
                  {userBooking.status === 'confirmed' ? 'Confirmed' : `Waitlist #${userBooking.waitlistPosition}`}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Actions - Single button based on slot type */}
        <div className="flex gap-3">
          {slotType === 'available' && (
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="w-full btn btn-primary btn-lg"
            >
              {loading ? (
                <>
                  <span className="spinner spinner-sm"></span>
                  Booking...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Confirm Booking
                </>
              )}
            </button>
          )}

          {slotType === 'full' && (
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="w-full btn btn-accent btn-lg"
            >
              {loading ? (
                <>
                  <span className="spinner spinner-sm"></span>
                  Joining...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Join Waitlist
                </>
              )}
            </button>
          )}

          {slotType === 'booked' && (
            <button
              onClick={handleCancelClick}
              disabled={loading}
              className="w-full btn btn-danger btn-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel Booking
            </button>
          )}
        </div>
      </div>

      {/* Cancel Booking Confirmation Modal */}
      {showCancelModal && userBooking && (
        <CancelBooking
          booking={{
            ...userBooking,
            resourceId: { name: resourceName },
            date: slot.date,
            slotNumber: slot.slotNumber
          }}
          onConfirm={handleCancelConfirm}
          onCancel={() => setShowCancelModal(false)}
          isLoading={loading}
        />
      )}
    </div>
  );
};

export default BookingModal;
