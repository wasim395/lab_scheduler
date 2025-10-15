import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { bookingsAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';
import CancelBooking from '../components/bookings/CancelBooking';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const { socket } = useSocket();

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await bookingsAPI.getMyBookings();
      setBookings(response.data.bookings);
    } catch (err) {
      setError('Failed to load bookings');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleWaitlistPromotion = useCallback((data) => {
    console.log('You have been promoted from waitlist!', data);
    fetchBookings();
    // Show a nice notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 z-50 alert alert-success animate-slide-up max-w-md shadow-2xl';
    notification.innerHTML = `
      <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
      </svg>
      <div>
        <div class="font-semibold">Promoted from Waitlist!</div>
        <div class="text-sm">You've been confirmed for your booking</div>
      </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
  }, [fetchBookings]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    if (socket) {
      socket.on('waitlist-promoted', handleWaitlistPromotion);
      return () => {
        socket.off('waitlist-promoted', handleWaitlistPromotion);
      };
    }
  }, [socket, handleWaitlistPromotion]);

  const handleCancelBooking = (booking) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
  };

  const handleCancelConfirm = useCallback(async (bookingId) => {
    try {
      setCancellingId(bookingId);
      await bookingsAPI.cancel(bookingId);
      
      await fetchBookings();
      
      setShowCancelModal(false);
      setSelectedBooking(null);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  }, [fetchBookings]);

  const getStatusBadge = (status, waitlistPosition) => {
    switch (status) {
      case 'confirmed':
        return <span className="badge badge-success">✓ Confirmed</span>;
      case 'waitlist':
        return <span className="badge badge-warning">⏳ Waitlist #{waitlistPosition}</span>;
      case 'cancelled':
        return <span className="badge badge-danger">✕ Cancelled</span>;
      default:
        return <span className="badge badge-info">{status}</span>;
    }
  };

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

  const groupBookingsByStatus = () => {
    const upcoming = bookings.filter(b => b.status === 'confirmed' || b.status === 'waitlist');
    const past = bookings.filter(b => b.status === 'cancelled');
    return { upcoming, past };
  };

  const { upcoming, past } = groupBookingsByStatus();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container-custom max-w-6xl">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-primary-500 rounded-xl flex items-center justify-center shadow-xl shadow-accent-500/30">
              <span className="text-3xl">📋</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold gradient-text">My Bookings</h1>
              <p className="text-gray-400 text-lg">Manage your lab resource reservations</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-error mb-6 animate-slide-up">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold gradient-text">{bookings.length}</div>
                <div className="text-sm text-gray-400 mt-1">Total Bookings</div>
              </div>
              <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-green-400">{upcoming.filter(b => b.status === 'confirmed').length}</div>
                <div className="text-sm text-gray-400 mt-1">Confirmed</div>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✓</span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-yellow-400">{upcoming.filter(b => b.status === 'waitlist').length}</div>
                <div className="text-sm text-gray-400 mt-1">On Waitlist</div>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Bookings */}
        {upcoming.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span>Upcoming Bookings</span>
              <span className="text-sm font-normal text-gray-500">({upcoming.length})</span>
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {upcoming.map((booking, index) => (
                <div
                  key={booking._id}
                  className="card card-hover p-6 animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        booking.status === 'confirmed' 
                          ? 'bg-green-500/20 border border-green-500/30' 
                          : 'bg-yellow-500/20 border border-yellow-500/30'
                      }`}>
                        <span className="text-2xl">{booking.status === 'confirmed' ? '✓' : '⏳'}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{booking.resourceId?.name || 'Unknown Resource'}</h3>
                        {getStatusBadge(booking.status, booking.waitlistPosition)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
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

                    <div className="flex items-center gap-2 text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs">Booked {format(new Date(booking.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCancelBooking(booking)}
                    disabled={cancellingId === booking._id}
                    className="w-full btn btn-danger btn-sm"
                  >
                    {cancellingId === booking._id ? (
                      <>
                        <span className="spinner spinner-sm"></span>
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel Booking
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Past Bookings */}
        {past.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span>Past Bookings</span>
              <span className="text-sm font-normal text-gray-500">({past.length})</span>
            </h2>
            <div className="card p-6">
              <div className="space-y-3">
                {past.map((booking) => (
                  <div
                    key={booking._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-dark-800/30 rounded-lg border border-dark-700/50 hover:border-dark-600 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-2 sm:mb-0">
                      <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center border border-red-500/30">
                        <span className="text-lg">✕</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-200">{booking.resourceId?.name || 'Unknown Resource'}</div>
                        <div className="text-sm text-gray-400">
                          {format(new Date(booking.date), 'MMM d, yyyy')} • {getSlotTime(booking.slotNumber)}
                        </div>
                      </div>
                    </div>
                    <span className="badge badge-danger">Cancelled</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {bookings.length === 0 && (
          <div className="card p-12 text-center animate-slide-up">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-bold text-gray-300 mb-2">No Bookings Yet</h3>
            <p className="text-gray-500 mb-6">
              You haven't made any bookings. Start by browsing available resources.
            </p>
            <a href="/dashboard" className="btn btn-primary">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Browse Resources
            </a>
          </div>
        )}
      </div>

      {showCancelModal && selectedBooking && (
        <CancelBooking
          booking={selectedBooking}
          onConfirm={() => handleCancelConfirm(selectedBooking._id)}
          onCancel={() => {
            setShowCancelModal(false);
            setSelectedBooking(null);
          }}
          isLoading={cancellingId === selectedBooking._id}
        />
      )}
    </div>
  );
};

export default MyBookings;
