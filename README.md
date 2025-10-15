# Lab Resource Scheduler MVP

A complete web application for managing shared laboratory equipment with automatic waitlist management. Built with React, Node.js, Express, MongoDB, and Socket.io for real-time updates.

## 🚀 Features

- **User Authentication**: JWT-based login/registration with role-based access (User/Admin)
- **Resource Management**: Create and manage lab equipment with configurable capacity
- **Smart Booking System**: Book 2-hour time slots with automatic waitlist management
- **Real-time Updates**: Live notifications via WebSockets when bookings change
- **FIFO Waitlist**: Fair first-in-first-out queue management
- **Concurrent Booking Limits**: Users can book up to 3 different resources for the same time slot
- **Responsive Design**: Works on desktop and mobile devices

## 🏗️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Socket.io** for real-time WebSocket communication
- **JWT** for authentication
- **bcryptjs** for password hashing

### Frontend
- **React 18** with functional components and hooks
- **React Router** for navigation
- **Socket.io Client** for real-time updates
- **Axios** for API calls
- **date-fns** for date manipulation
- **Custom CSS** for styling

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd lab-management
```

### 2. Backend Setup
```bash
cd backend
npm install
```

### 3. Environment Configuration
Copy the environment template and fill in your values:
```bash
cp env.example .env
```

Edit `.env` file:
```env
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string_here

# JWT Secret Key (generate a random string)
JWT_SECRET=your_jwt_secret_key_here

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### 4. Frontend Setup
```bash
cd ../frontend
npm install
```

### 5. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🌱 Seed Data

To populate the database with test data:

```bash
cd backend
npm run seed
```

This creates:
- **Admin user**: admin@example.com / admin123
- **Regular users**: alice@example.com, bob@example.com, charlie@example.com, diana@example.com (all with password: user123)
- **Sample resources**: 3D Printer (capacity: 2), Microscope (capacity: 1), Laser Cutter (capacity: 3)
- **Sample bookings**: Pre-configured bookings to test waitlist functionality

## 🧪 Testing the Acceptance Criteria

### Scenario 1: Basic Booking Flow
1. Login as Alice (alice@example.com / user123)
2. Go to Dashboard → View Schedule for "3D Printer"
3. Try to book Slot 1 for tomorrow
4. Should go to waitlist (position #3) since capacity is 2 and already has 2 confirmed bookings

### Scenario 2: Waitlist Promotion
1. Login as Bob (bob@example.com / user123)
2. Go to My Bookings
3. Cancel Bob's 3D Printer booking for Slot 1
4. Charlie should automatically be promoted from waitlist to confirmed
5. Diana should move from waitlist position #2 to #1

### Scenario 3: Real-time Updates
1. Open two browser windows
2. Login as different users in each window
3. Cancel a booking in one window
4. Watch the other window update automatically without refresh

## 📱 Application Structure

### Pages
- **Home** (`/`) - Landing page with app description
- **Login** (`/login`) - User authentication
- **Register** (`/register`) - New user registration
- **Dashboard** (`/dashboard`) - Main hub showing all resources
- **Resource Schedule** (`/resources/:id/schedule`) - Calendar view for booking slots
- **My Bookings** (`/my-bookings`) - User's booking management
- **Admin Resources** (`/admin/resources`) - Resource management (admin only)
- **Create Resource** (`/admin/resources/new`) - Add new resources (admin only)

### Key Components
- **BookingModal** - Confirm booking or join waitlist
- **Navbar** - Navigation with role-based menu items
- **PrivateRoute** - Protect routes requiring authentication
- **AdminRoute** - Protect admin-only routes

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Resources
- `GET /api/resources` - List all resources
- `POST /api/resources` - Create resource (admin)
- `PUT /api/resources/:id` - Update resource (admin)
- `DELETE /api/resources/:id` - Delete resource (admin)
- `GET /api/resources/:id/schedule` - Get resource schedule

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my` - Get user's bookings
- `DELETE /api/bookings/:id` - Cancel booking
- `GET /api/bookings/availability/:resourceId/:date/:slotNumber` - Check availability

## 🔄 Real-time Events

### WebSocket Events
- `booking-created` - New booking created
- `booking-cancelled` - Booking cancelled
- `waitlist-promoted` - User promoted from waitlist
- `slot-availability-changed` - Slot availability updated

## 🎯 Business Rules

1. **Time Slots**: Fixed 2-hour slots (8am-10am, 10am-12pm, etc.)
2. **Capacity**: Each resource has a configurable capacity (1-50 users)
3. **Concurrent Limits**: Users can book max 3 different resources for same time slot
4. **Waitlist**: FIFO queue when slots are full
5. **Real-time**: Automatic promotion and notifications via WebSockets

## 🚀 Production Deployment

### Environment Variables
Set these in your production environment:
- `MONGODB_URI` - Production MongoDB connection string
- `JWT_SECRET` - Strong, random secret key
- `NODE_ENV=production`
- `FRONTEND_URL` - Your production frontend URL

### Build Frontend
```bash
cd frontend
npm run build
```

### Start Production Server
```bash
cd backend
npm start
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Verify your MongoDB URI is correct
   - Ensure MongoDB is running (if using local instance)
   - Check network connectivity (if using Atlas)

2. **CORS Errors**
   - Verify `FRONTEND_URL` in backend `.env` matches your frontend URL
   - Check that both servers are running on correct ports

3. **Authentication Issues**
   - Clear browser localStorage and try logging in again
   - Verify JWT_SECRET is set in backend environment

4. **WebSocket Connection Failed**
   - Check that Socket.io server is running
   - Verify CORS settings allow your frontend URL

## 📄 License

MIT License - feel free to use this project for educational or commercial purposes.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For questions or issues, please create an issue in the repository or contact the development team.

