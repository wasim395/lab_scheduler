import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { token, isAuthenticated } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated() && token) {
      // Only create new socket if we don't have one already
      if (!socketRef.current) {
        // Initialize socket connection
        const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
          auth: {
            token: token
          }
        });

        // Connection event handlers
        newSocket.on('connect', () => {
          console.log('Socket connected:', newSocket.id);
          setConnected(true);
        });

        newSocket.on('disconnect', () => {
          console.log('Socket disconnected');
          setConnected(false);
        });

        newSocket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          setConnected(false);
        });

        // Authentication success
        newSocket.on('connected', (data) => {
          console.log('Socket authenticated:', data);
        });

        // Auto-reconnect on token refresh
        newSocket.on('reconnect', () => {
          console.log('Socket reconnected');
          setConnected(true);
        });

        socketRef.current = newSocket;
        setSocket(newSocket);
      }
    } else {
      // Disconnect socket if user logs out
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
        setSocket(null);
        setConnected(false);
      }
    }

    // Cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
        setSocket(null);
        setConnected(false);
      }
    };
  }, [isAuthenticated, token]);

  // Socket utility functions
  const joinResource = useCallback((resourceId) => {
    if (socket && connected) {
      socket.emit('join-resource', resourceId);
    }
  }, [socket, connected]);

  const leaveResource = useCallback((resourceId) => {
    if (socket && connected) {
      socket.emit('leave-resource', resourceId);
    }
  }, [socket, connected]);

  const joinSlot = useCallback((resourceId, date, slotNumber) => {
    if (socket && connected) {
      socket.emit('join-slot', { resourceId, date, slotNumber });
    }
  }, [socket, connected]);

  const leaveSlot = useCallback((resourceId, date, slotNumber) => {
    if (socket && connected) {
      socket.emit('leave-slot', { resourceId, date, slotNumber });
    }
  }, [socket, connected]);

  const subscribeToBookingUpdates = useCallback((resourceId, date, slotNumber) => {
    if (socket && connected) {
      socket.emit('subscribe-booking-updates', { resourceId, date, slotNumber });
    }
  }, [socket, connected]);

  const unsubscribeFromBookingUpdates = useCallback((resourceId, date, slotNumber) => {
    if (socket && connected) {
      socket.emit('unsubscribe-booking-updates', { resourceId, date, slotNumber });
    }
  }, [socket, connected]);

  const value = {
    socket,
    connected,
    joinResource,
    leaveResource,
    joinSlot,
    leaveSlot,
    subscribeToBookingUpdates,
    unsubscribeFromBookingUpdates,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

