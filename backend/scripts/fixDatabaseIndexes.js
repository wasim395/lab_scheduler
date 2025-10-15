const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('../config/db');

const fixDatabaseIndexes = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('Fixing database indexes...');

    // Get the database connection
    const db = mongoose.connection.db;

    // Drop the problematic index
    try {
      await db.collection('users').dropIndex('name_1');
      console.log('Dropped problematic name_1 index');
    } catch (error) {
      if (error.code === 27) {
        console.log('name_1 index does not exist, skipping...');
      } else {
        console.log('Error dropping name_1 index:', error.message);
      }
    }

    // Ensure the correct indexes exist
    try {
      await db.collection('users').createIndex({ username: 1 }, { unique: true });
      console.log('Created username_1 unique index');
    } catch (error) {
      console.log('Username index already exists or error:', error.message);
    }

    try {
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
      console.log('Created email_1 unique index');
    } catch (error) {
      console.log('Email index already exists or error:', error.message);
    }

    // Clean up any documents with null username
    const result = await db.collection('users').deleteMany({ username: null });
    console.log(`Deleted ${result.deletedCount} documents with null username`);

    // Clean up any documents with null email
    const emailResult = await db.collection('users').deleteMany({ email: null });
    console.log(`Deleted ${emailResult.deletedCount} documents with null email`);

    // Fix Booking collection indexes
    try {
      await db.collection('bookings').dropIndex('resource_1_bookingDate_1_slotNumber_1');
      console.log('Dropped problematic resource_1_bookingDate_1_slotNumber_1 index');
    } catch (error) {
      if (error.code === 27) {
        console.log('resource_1_bookingDate_1_slotNumber_1 index does not exist, skipping...');
      } else {
        console.log('Error dropping resource_1_bookingDate_1_slotNumber_1 index:', error.message);
      }
    }

    // Clean up any documents with null resourceId
    const bookingResult = await db.collection('bookings').deleteMany({ resourceId: null });
    console.log(`Deleted ${bookingResult.deletedCount} documents with null resourceId`);

    // Clean up any documents with null userId
    const userBookingResult = await db.collection('bookings').deleteMany({ userId: null });
    console.log(`Deleted ${userBookingResult.deletedCount} documents with null userId`);

    console.log('Database indexes fixed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error fixing database indexes:', error);
    process.exit(1);
  }
};

// Run if this file is executed directly
if (require.main === module) {
  fixDatabaseIndexes();
}

module.exports = fixDatabaseIndexes;
