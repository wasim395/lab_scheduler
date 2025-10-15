import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { resourcesAPI } from '../services/api';

const Dashboard = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await resourcesAPI.getAll();
      setResources(response.data);
    } catch (err) {
      setError('Failed to load resources');
      console.error('Error fetching resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const getResourceIcon = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('printer') || lowerName.includes('3d')) return '🖨️';
    if (lowerName.includes('microscope')) return '🔬';
    if (lowerName.includes('laser')) return '⚡';
    if (lowerName.includes('centrifuge')) return '🌀';
    if (lowerName.includes('incubator')) return '🧫';
    if (lowerName.includes('computer')) return '💻';
    if (lowerName.includes('scanner')) return '📊';
    return '🔧';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-400">Loading resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8 sm:mb-12 animate-slide-up">
          <div className="flex items-center gap-3 sm:gap-4 mb-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-xl shadow-primary-500/30">
              <span className="text-2xl sm:text-3xl lg:text-4xl">📅</span>
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text">Dashboard</h1>
              <p className="text-gray-400 text-base sm:text-lg lg:text-xl">Browse and book available lab resources</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-error mb-8 animate-slide-up">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Resources Grid */}
        {resources.length === 0 ? (
          <div className="card p-12 text-center animate-slide-up">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-bold text-gray-300 mb-2">No Resources Available</h3>
            <p className="text-gray-500">
              There are currently no lab resources available for booking.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-200">
                Available Resources
                <span className="ml-3 text-lg font-normal text-gray-500">
                  ({resources.length} {resources.length === 1 ? 'resource' : 'resources'})
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {resources.map((resource, index) => (
                <div
                  key={resource._id}
                  className="card card-hover p-5 sm:p-6 group animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Resource Icon */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-xl flex items-center justify-center text-2xl sm:text-3xl lg:text-4xl border border-primary-500/30 group-hover:scale-110 transition-transform duration-300">
                      {getResourceIcon(resource.name)}
                    </div>
                    <div className="badge badge-info text-xs sm:text-sm">
                      <svg className="icon-xs" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {resource.capacity} {resource.capacity === 1 ? 'slot' : 'slots'}
                    </div>
                  </div>

                  {/* Resource Info */}
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">
                    {resource.name}
                  </h3>
                  <p className="text-gray-400 text-xs sm:text-sm mb-5 sm:mb-6 line-clamp-2">
                    {resource.description || 'No description available'}
                  </p>

                  {/* Action Button */}
                  <Link
                    to={`/resources/${resource._id}/schedule`}
                    className="btn btn-primary w-full group-hover:shadow-xl group-hover:shadow-primary-500/30 text-sm sm:text-base"
                  >
                    <svg className="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    View Schedule
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="card p-6 bg-gradient-to-br from-primary-500/10 to-transparent border-primary-500/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center text-2xl">
                ⏰
              </div>
              <div>
                <div className="text-2xl font-bold text-white">8 Slots</div>
                <div className="text-sm text-gray-400">2-hour intervals daily</div>
              </div>
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-accent-500/10 to-transparent border-accent-500/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent-500/20 rounded-lg flex items-center justify-center text-2xl">
                🔔
              </div>
              <div>
                <div className="text-2xl font-bold text-white">Real-time</div>
                <div className="text-sm text-gray-400">Instant updates</div>
              </div>
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-green-500/10 to-transparent border-green-500/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center text-2xl">
                📝
              </div>
              <div>
                <div className="text-2xl font-bold text-white">Waitlist</div>
                <div className="text-sm text-gray-400">Auto promotion</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
