import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import PrivateRoute from './components/common/PrivateRoute';
import AdminRoute from './components/common/AdminRoute';
import Navbar from './components/common/Navbar';

// Pages
import Home from './pages/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './pages/Dashboard';
import ResourceSchedule from './pages/ResourceSchedule';
import MyBookings from './pages/MyBookings';
import AdminResources from './pages/AdminResources';
import CreateResource from './pages/CreateResource';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="App">
            <Navbar />
            <main>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected routes */}
                <Route path="/dashboard" element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } />
                
                <Route path="/resources/:id/schedule" element={
                  <PrivateRoute>
                    <ResourceSchedule />
                  </PrivateRoute>
                } />
                
                <Route path="/my-bookings" element={
                  <PrivateRoute>
                    <MyBookings />
                  </PrivateRoute>
                } />
                
                {/* Admin routes */}
                <Route path="/admin/resources" element={
                  <AdminRoute>
                    <AdminResources />
                  </AdminRoute>
                } />
                
                <Route path="/admin/resources/new" element={
                  <AdminRoute>
                    <CreateResource />
                  </AdminRoute>
                } />
                
                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;

