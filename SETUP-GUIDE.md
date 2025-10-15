# 🚀 Lab Resource Scheduler - Complete Setup Guide

## ✅ **Current Status: READY TO RUN**

Both servers are now running in the background:
- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:3000

## 🔧 **Quick Start (Windows)**

### Option 1: Use the Batch Script
```bash
# Double-click start-app.bat in the project root
# This will automatically start both servers
```

### Option 2: Manual Start
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm start
```

## 🌐 **Access the Application**

1. **Open your browser** and go to: http://localhost:3000
2. **Login with demo accounts**:
   - Admin: `admin@example.com` / `admin123`
   - User: `alice@example.com` / `user123`

## 🗄️ **Database Setup**

### Option A: Local MongoDB (Recommended for Development)
1. Install MongoDB locally
2. Start MongoDB service
3. The app will connect to `mongodb://localhost:27017/lab-scheduler`

### Option B: MongoDB Atlas (Cloud)
1. Create free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `backend/.env` file:
   ```
   MONGODB_URI=your_atlas_connection_string_here
   ```

## 🧪 **Test the Application**

### 1. Create Test Data
```bash
cd backend
npm run seed
```

### 2. Test Acceptance Criteria
1. Login as Alice (alice@example.com / user123)
2. Go to Dashboard → View Schedule for "3D Printer"
3. Try to book Slot 1 for tomorrow
4. Should go to waitlist (position #3)
5. Login as Bob (bob@example.com / user123)
6. Cancel Bob's booking
7. Alice should be promoted from waitlist to confirmed

## 🐛 **Troubleshooting**

### Backend Issues
- **Port 5000 in use**: Change PORT in `backend/.env`
- **MongoDB connection failed**: Check MongoDB is running or Atlas connection string
- **JWT errors**: Check JWT_SECRET in `backend/.env`

### Frontend Issues
- **Port 3000 in use**: React will automatically use next available port
- **API connection failed**: Check backend is running on port 5000
- **WebSocket errors**: Check Socket.io connection in browser console

### Common Solutions
1. **Clear browser cache** and refresh
2. **Restart both servers** if changes aren't reflected
3. **Check console logs** for specific error messages
4. **Verify .env files** have correct values

## 📱 **Features Available**

### For All Users:
- ✅ User registration and login
- ✅ View available resources
- ✅ Book time slots (2-hour slots)
- ✅ Join waitlist when full
- ✅ Cancel bookings
- ✅ Real-time updates via WebSocket

### For Admins:
- ✅ Create/edit/delete resources
- ✅ Generate time slots
- ✅ View all bookings
- ✅ Manage system settings

## 🔒 **Security Notes**

- JWT tokens expire after 7 days
- Passwords are hashed with bcrypt
- CORS is configured for localhost:3000
- Environment variables are protected

## 📊 **Performance**

- Real-time updates via Socket.io
- Efficient MongoDB queries with indexes
- Responsive design for mobile/desktop
- Optimized React components

## 🎯 **Next Steps**

1. **Test the application** with the demo accounts
2. **Create your own resources** as an admin
3. **Book some time slots** as a regular user
4. **Test the waitlist functionality** by overbooking
5. **Verify real-time updates** work in multiple browser windows

## 🆘 **Need Help?**

- Check the browser console for errors
- Check the backend terminal for server logs
- Verify all environment variables are set
- Ensure MongoDB is running and accessible

---

**🎉 Your Lab Resource Scheduler MVP is now fully functional!**
