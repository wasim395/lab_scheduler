const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Resource = require('../models/Resource');
const Booking = require('../models/Booking');
const SystemSettings = require('../models/SystemSettings');

const connectDB = require('../config/db');

const seedData = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('Starting seed data creation...');

    // Clear existing data
    await User.deleteMany({});
    await Resource.deleteMany({});
    await Booking.deleteMany({});
    await SystemSettings.deleteMany({});

    console.log('Cleared existing data');

    // Create system settings
    const maxConcurrentSetting = new SystemSettings({
      key: 'maxConcurrentBookings',
      value: 3,
      description: 'Maximum number of different resources a user can book for the same time slot'
    });
    await maxConcurrentSetting.save();

    // Create admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin'
    });
    await adminUser.save();

    // Create regular users
    const users = [
      {
        username: 'alice',
        email: 'alice@example.com',
        password: 'user123',
        role: 'user'
      },
      {
        username: 'bob',
        email: 'bob@example.com',
        password: 'user123',
        role: 'user'
      },
      {
        username: 'charlie',
        email: 'charlie@example.com',
        password: 'user123',
        role: 'user'
      },
      {
        username: 'diana',
        email: 'diana@example.com',
        password: 'user123',
        role: 'user'
      }
    ];

    const createdUsers = [];
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
    }

    // Create resources
    const resources = [
      {
        name: '3D Printer',
        description: 'High-resolution 3D printer for prototyping',
        capacity: 2
      },
      {
        name: 'Microscope',
        description: 'Digital microscope for research',
        capacity: 1
      },
      {
        name: 'Laser Cutter',
        description: 'Precision laser cutting machine',
        capacity: 3
      }
    ];

    const createdResources = [];
    for (const resourceData of resources) {
      const resource = new Resource(resourceData);
      await resource.save();
      createdResources.push(resource);
    }

    // Create some sample bookings for testing
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Alice books 3D Printer slot 1 tomorrow (confirmed)
    const aliceBooking1 = new Booking({
      userId: createdUsers[0]._id,
      resourceId: createdResources[0]._id,
      date: tomorrow,
      slotNumber: 1,
      status: 'confirmed'
    });
    await aliceBooking1.save();

    // Bob books 3D Printer slot 1 tomorrow (confirmed - at capacity)
    const bobBooking1 = new Booking({
      userId: createdUsers[1]._id,
      resourceId: createdResources[0]._id,
      date: tomorrow,
      slotNumber: 1,
      status: 'confirmed'
    });
    await bobBooking1.save();

    // Charlie books 3D Printer slot 1 tomorrow (waitlist position 1)
    const charlieBooking1 = new Booking({
      userId: createdUsers[2]._id,
      resourceId: createdResources[0]._id,
      date: tomorrow,
      slotNumber: 1,
      status: 'waitlist',
      waitlistPosition: 1
    });
    await charlieBooking1.save();

    // Diana books 3D Printer slot 1 tomorrow (waitlist position 2)
    const dianaBooking1 = new Booking({
      userId: createdUsers[3]._id,
      resourceId: createdResources[0]._id,
      date: tomorrow,
      slotNumber: 1,
      status: 'waitlist',
      waitlistPosition: 2
    });
    await dianaBooking1.save();

    // Alice books Microscope slot 3 tomorrow (confirmed)
    const aliceBooking2 = new Booking({
      userId: createdUsers[0]._id,
      resourceId: createdResources[1]._id,
      date: tomorrow,
      slotNumber: 3,
      status: 'confirmed'
    });
    await aliceBooking2.save();

    // Bob books Laser Cutter slot 5 tomorrow (confirmed)
    const bobBooking2 = new Booking({
      userId: createdUsers[1]._id,
      resourceId: createdResources[2]._id,
      date: tomorrow,
      slotNumber: 5,
      status: 'confirmed'
    });
    await bobBooking2.save();

    console.log('Seed data created successfully!');
    console.log('\n=== CREATED DATA ===');
    console.log('Admin User:');
    console.log(`  Email: admin@example.com`);
    console.log(`  Password: admin123`);
    console.log(`  Role: admin`);
    
    console.log('\nRegular Users:');
    createdUsers.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.username} (${user.email}) - Password: user123`);
    });

    console.log('\nResources:');
    createdResources.forEach((resource, index) => {
      console.log(`  ${index + 1}. ${resource.name} - Capacity: ${resource.capacity}`);
    });

    console.log('\nSample Bookings (Tomorrow):');
    console.log('  3D Printer Slot 1 (8am-10am):');
    console.log('    - Alice: Confirmed');
    console.log('    - Bob: Confirmed (at capacity)');
    console.log('    - Charlie: Waitlist #1');
    console.log('    - Diana: Waitlist #2');
    console.log('  Microscope Slot 3 (12pm-2pm):');
    console.log('    - Alice: Confirmed');
    console.log('  Laser Cutter Slot 5 (4pm-6pm):');
    console.log('    - Bob: Confirmed');

    console.log('\n=== TESTING SCENARIOS ===');
    console.log('1. Login as Alice (alice@example.com / user123)');
    console.log('2. Try to book 3D Printer Slot 1 - should go to waitlist');
    console.log('3. Login as Bob (bob@example.com / user123)');
    console.log('4. Cancel Bob\'s 3D Printer booking - Charlie should be promoted');
    console.log('5. Check real-time updates in UI');

    console.log('\nSeed data creation completed!');
    process.exit(0);

  } catch (error) {
    console.error('Error creating seed data:', error);
    process.exit(1);
  }
};

// Run seed data if this file is executed directly
if (require.main === module) {
  seedData();
}

module.exports = seedData;

