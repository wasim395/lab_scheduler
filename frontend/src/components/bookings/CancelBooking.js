import React from 'react';
import { format } from 'date-fns';

const CancelBooking = ({ booking, onConfirm, onCancel, isLoading }) => {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="card max-w-md w-full p-8 animate-slide-up">
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center border border-red-500/30 flex-shrink-0">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Cancel Booking</h2>
            <p className="text-gray-400">Are you sure you want to cancel this booking?</p>
          </div>
        </div>

        {/* Booking Details */}
        <div className="bg-dark-800/50 rounded-lg p-4 border border-dark-700 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
              <span className="text-xl">🔬</span>
            </div>
            <div>
              <div className="text-sm text-gray-400">Resource</div>
              <div className="font-semibold text-white">{booking.resourceId?.name || 'Unknown Resource'}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-300">
              <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm">{format(new Date(booking.date), 'EEEE, MMMM d, yyyy')}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-300">
              <svg className="w-5 h-5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">{getSlotTime(booking.slotNumber)}</span>
            </div>

            {booking.status === 'waitlist' && (
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-yellow-400">Waitlist Position #{booking.waitlistPosition}</span>
              </div>
            )}
          </div>
        </div>

        {/* Warning */}
        {booking.status === 'confirmed' && (
          <div className="alert alert-warning mb-6">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <div className="font-semibold">Note</div>
              <div className="text-sm">
                The next person on the waitlist will automatically be promoted
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 btn btn-danger btn-lg"
          >
            {isLoading ? (
              <>
                <span className="spinner spinner-sm"></span>
                Cancelling...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Yes, Cancel Booking
              </>
            )}
          </button>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 btn btn-secondary btn-lg"
          >
            Keep Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelBooking;
