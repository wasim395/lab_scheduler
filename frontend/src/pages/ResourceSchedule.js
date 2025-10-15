import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format, addDays, startOfDay } from 'date-fns';
import { resourcesAPI, bookingsAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';
import BookingModal from '../components/bookings/BookingModal';

const ResourceSchedule = () => {
  const { id: resourceId } = useParams();
  const navigate = useNavigate();
  const { socket, subscribeToBookingUpdates, unsubscribeFromBookingUpdates } = useSocket();
  
  const [resource, setResource] = useState(null);
  const [schedule, setSchedule] = useState({});
  const [currentDate, setCurrentDate] = useState(startOfDay(new Date()));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const getDateRange = (startDate) => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      dates.push(addDays(startDate, i));
    }
    return dates;
  };

  const dates = useMemo(() => getDateRange(currentDate), [currentDate]);

  const fetchResourceAndSchedule = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const resourceResponse = await resourcesAPI.getById(resourceId);
      setResource(resourceResponse.data);

      const startDate = format(dates[0], 'yyyy-MM-dd');
      const endDate = format(dates[6], 'yyyy-MM-dd');
      
      const scheduleResponse = await resourcesAPI.getSchedule(resourceId, startDate, endDate);
      setSchedule(scheduleResponse.data.schedule);

    } catch (err) {
      setError('Failed to load resource schedule');
      console.error('Error fetching schedule:', err);
    } finally {
      setLoading(false);
    }
  }, [resourceId, dates]);

  const handleBookingUpdate = useCallback((data) => {
    fetchResourceAndSchedule();
  }, [fetchResourceAndSchedule]);

  const handleWaitlistPromotion = useCallback((data) => {
    console.log('Waitlist promotion:', data);
    fetchResourceAndSchedule();
  }, [fetchResourceAndSchedule]);

  useEffect(() => {
    fetchResourceAndSchedule();
  }, [fetchResourceAndSchedule]);

  useEffect(() => {
    if (socket && resourceId) {
      dates.forEach(date => {
        for (let slot = 1; slot <= 8; slot++) {
          subscribeToBookingUpdates(resourceId, format(date, 'yyyy-MM-dd'), slot);
        }
      });
      socket.on('booking-created', handleBookingUpdate);
      socket.on('booking-cancelled', handleBookingUpdate);
      socket.on('waitlist-promoted', handleWaitlistPromotion);
      return () => {
        dates.forEach(date => {
          for (let slot = 1; slot <= 8; slot++) {
            unsubscribeFromBookingUpdates(resourceId, format(date, 'yyyy-MM-dd'), slot);
          }
        });
        socket.off('booking-created', handleBookingUpdate);
        socket.off('booking-cancelled', handleBookingUpdate);
        socket.off('waitlist-promoted', handleWaitlistPromotion);
      };
    }
  }, [socket, resourceId, currentDate, dates, handleBookingUpdate, handleWaitlistPromotion, subscribeToBookingUpdates, unsubscribeFromBookingUpdates]);

  const handleSlotClick = async (date, slotNumber) => {
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const availability = await bookingsAPI.checkAvailability(resourceId, dateStr, slotNumber);
      
      setSelectedSlot({
        date: dateStr,
        slotNumber,
        availability: availability.data
      });
      setShowBookingModal(true);
    } catch (err) {
      setError('Failed to check slot availability');
    }
  };

  const handleBookingSuccess = () => {
    setShowBookingModal(false);
    setSelectedSlot(null);
    fetchResourceAndSchedule();
  };

  const handlePrevWeek = () => {
    setCurrentDate(prev => addDays(prev, -7));
  };

  const handleNextWeek = () => {
    setCurrentDate(prev => addDays(prev, 7));
  };

  const handleToday = () => {
    setCurrentDate(startOfDay(new Date()));
  };

  const getSlotTimes = () => ({
    1: '8:00 AM - 10:00 AM',
    2: '10:00 AM - 12:00 PM',
    3: '12:00 PM - 2:00 PM',
    4: '2:00 PM - 4:00 PM',
    5: '4:00 PM - 6:00 PM',
    6: '6:00 PM - 8:00 PM',
    7: '8:00 PM - 10:00 PM',
    8: '10:00 PM - 12:00 AM'
  });

  const getSlotClass = (dateStr, slotNumber) => {
    const slot = schedule[dateStr]?.[slotNumber];
    if (!slot) return 'slot-card slot-available';
    
    if (slot.userBooking) {
      return slot.userBooking.status === 'confirmed' 
        ? 'slot-card slot-booked' 
        : 'slot-card slot-waitlist';
    }
    
    if (slot.isAvailable) {
      return 'slot-card slot-available';
    }
    
    return 'slot-card slot-full';
  };

  const getSlotLabel = (dateStr, slotNumber) => {
    const slot = schedule[dateStr]?.[slotNumber];
    if (!slot) return { text: 'Available', badge: 'badge-success' };
    
    if (slot.userBooking) {
      if (slot.userBooking.status === 'confirmed') {
        return { text: 'Your Booking', badge: 'badge-info' };
      } else {
        return { text: `Waitlist #${slot.userBooking.waitlistPosition}`, badge: 'badge-warning' };
      }
    }
    
    if (slot.isAvailable) {
      return { text: `${slot.totalConfirmed}/${slot.capacity}`, badge: 'badge-success' };
    }
    
    return { text: 'Full', badge: 'badge-danger' };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-400">Loading schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container-custom max-w-7xl">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-gray-400 hover:text-primary-400 transition-colors mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>

          {resource && (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-xl shadow-primary-500/30 text-3xl">
                  🔬
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">{resource.name}</h1>
                  <p className="text-gray-400">{resource.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="badge badge-info">
                      Capacity: {resource.capacity}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="alert alert-error mb-6 animate-slide-up">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Week Navigation */}
        <div className="card p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <button onClick={handlePrevWeek} className="btn btn-secondary">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous Week
            </button>
            
            <div className="text-center">
              <h2 className="text-xl font-bold text-white">
                {format(dates[0], 'MMM d, yyyy')} - {format(dates[6], 'MMM d, yyyy')}
              </h2>
              <button onClick={handleToday} className="text-sm text-primary-400 hover:text-primary-300 mt-1">
                Jump to Today
              </button>
            </div>

            <button onClick={handleNextWeek} className="btn btn-secondary">
              Next Week
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Schedule Grid */}
        <div className="card p-4 md:p-6 overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left p-3 text-gray-400 font-semibold w-40">Time Slot</th>
                {dates.map(date => (
                  <th key={date.toISOString()} className="p-3 text-center min-w-[120px]">
                    <div className="text-sm font-semibold text-gray-300">
                      {format(date, 'EEE')}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {format(date, 'MMM d')}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(getSlotTimes()).map(([slotNumber, timeRange]) => (
                <tr key={slotNumber} className="border-b border-dark-800">
                  <td className="p-3">
                    <div className="text-sm font-medium text-gray-300">{timeRange}</div>
                    <div className="text-xs text-gray-500">Slot {slotNumber}</div>
                  </td>
                  {dates.map(date => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    const label = getSlotLabel(dateStr, parseInt(slotNumber));
                    return (
                      <td key={date.toISOString()} className="p-2">
                        <button
                          onClick={() => handleSlotClick(date, parseInt(slotNumber))}
                          className={`${getSlotClass(dateStr, parseInt(slotNumber))} w-full text-center`}
                        >
                          <div className="text-xs font-semibold mb-1">
                            <span className={`badge ${label.badge}`}>
                              {label.text}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400">
                            {schedule[dateStr]?.[parseInt(slotNumber)]?.totalWaitlist > 0 && (
                              <span className="text-yellow-400">
                                +{schedule[dateStr][parseInt(slotNumber)].totalWaitlist} waitlist
                              </span>
                            )}
                          </div>
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="card p-6 mt-6">
          <h3 className="text-sm font-semibold text-gray-400 mb-4">LEGEND</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500/30"></div>
              <span className="text-sm text-gray-300">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500/20 border border-red-500/30"></div>
              <span className="text-sm text-gray-300">Full</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500/20 border border-blue-500/30"></div>
              <span className="text-sm text-gray-300">Your Booking</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-500/20 border border-yellow-500/30"></div>
              <span className="text-sm text-gray-300">On Waitlist</span>
            </div>
          </div>
        </div>
      </div>

      {showBookingModal && selectedSlot && (
        <BookingModal
          resourceId={resourceId}
          resourceName={resource?.name}
          slot={selectedSlot}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedSlot(null);
          }}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};

export default ResourceSchedule;
