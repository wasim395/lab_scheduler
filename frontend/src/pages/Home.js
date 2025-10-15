import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: '📅',
      title: 'Easy Scheduling',
      description: 'Book lab resources with a simple, intuitive calendar interface'
    },
    {
      icon: '⏰',
      title: 'Fixed Time Slots',
      description: '8 convenient 2-hour slots from 8 AM to 12 AM daily'
    },
    {
      icon: '📊',
      title: 'Real-time Updates',
      description: 'Instant notifications via WebSocket when slots become available'
    },
    {
      icon: '📝',
      title: 'Waitlist System',
      description: 'Automatic FIFO waitlist with position tracking and promotion'
    },
    {
      icon: '👥',
      title: 'Team Management',
      description: 'Admin controls for resource creation and monitoring'
    },
    {
      icon: '🔔',
      title: 'Smart Notifications',
      description: 'Get notified when you\'re promoted from waitlist'
    }
  ];

  if (isAuthenticated()) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="text-center max-w-2xl animate-fade-in">
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center shadow-2xl shadow-primary-500/30 mb-6">
              <span className="text-5xl">🔬</span>
            </div>
            <h1 className="text-4xl font-bold gradient-text mb-4">
              Welcome Back!
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              You're already logged in. Ready to manage your bookings?
            </p>
          </div>
          <Link to="/dashboard" className="btn btn-primary btn-lg">
            Go to Dashboard
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-accent-500/10 to-transparent"></div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/30 rounded-full text-primary-400 text-sm font-medium mb-8">
              <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse"></span>
              Real-time Lab Resource Management
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 leading-tight">
              <span className="gradient-text">Effortless</span> Lab
              <br />
              Resource Scheduling
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-gray-400 mb-10 sm:mb-12 max-w-3xl mx-auto leading-relaxed">
              Book laboratory equipment seamlessly with automatic waitlist management,
              real-time updates, and an intuitive scheduling interface.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              <Link to="/register" className="btn btn-primary btn-lg w-full sm:w-auto sm:min-w-[220px]">
                Get Started Free
                <svg className="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg w-full sm:w-auto sm:min-w-[220px]">
                Sign In
                <svg className="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
              <div className="card p-6">
                <div className="text-4xl font-bold gradient-text mb-2">24/7</div>
                <div className="text-gray-400">Booking Access</div>
              </div>
              <div className="card p-6">
                <div className="text-4xl font-bold gradient-text mb-2">8</div>
                <div className="text-gray-400">Daily Time Slots</div>
              </div>
              <div className="card p-6">
                <div className="text-4xl font-bold gradient-text mb-2">∞</div>
                <div className="text-gray-400">Resources Supported</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-dark-900/50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold gradient-text mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Powerful features designed to make lab resource management effortless
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card card-hover p-6 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container-custom">
          <div className="card card-hover p-12 text-center bg-gradient-to-br from-primary-500/10 to-accent-500/10 border-primary-500/30">
            <h2 className="text-4xl font-bold gradient-text mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Join now and experience seamless lab resource scheduling with real-time updates
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="btn btn-primary btn-lg">
                Create Free Account
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-dark-700/50">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <span className="text-xl">🔬</span>
              </div>
              <span className="font-bold gradient-text">Lab Scheduler</span>
            </div>
            <p className="text-gray-500 text-sm">
              © 2025 Lab Resource Scheduler. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
