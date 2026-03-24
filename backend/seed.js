const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Patient = require('./models/Patient');

const connectDB = require('./config/db');

const seedData = async () => {
  await connectDB();

  console.log('Clearing existing data...');
  await User.deleteMany({});
  await Patient.deleteMany({});

  console.log('Creating users...');

  const users = await User.create([
    {
      name: 'Dr. Admin User',
      email: 'admin@denticare.com',
      password: 'admin123',
      role: 'admin',
      phone: '+1-555-0001',
      isActive: true,
    },
    {
      name: 'Dr. Sarah Johnson',
      email: 'dentist1@denticare.com',
      password: 'dentist123',
      role: 'dentist',
      phone: '+1-555-0002',
      specialization: 'General Dentistry',
      licenseNumber: 'DDS-12345',
      isActive: true,
    },
    {
      name: 'Dr. Michael Chen',
      email: 'dentist2@denticare.com',
      password: 'dentist123',
      role: 'dentist',
      phone: '+1-555-0003',
      specialization: 'Orthodontics',
      licenseNumber: 'DDS-67890',
      isActive: true,
    },
    {
      name: 'Dr. Emily Rodriguez',
      email: 'dentist3@denticare.com',
      password: 'dentist123',
      role: 'dentist',
      phone: '+1-555-0004',
      specialization: 'Oral Surgery',
      licenseNumber: 'DDS-11223',
      isActive: true,
    },
    {
      name: 'Alice Thompson',
      email: 'receptionist@denticare.com',
      password: 'reception123',
      role: 'receptionist',
      phone: '+1-555-0005',
      isActive: true,
    },
  ]);

  console.log('✅ Users created:', users.length);

  // Create sample patients
  const patients = await Patient.create([
    {
      name: 'John Smith',
      dateOfBirth: new Date('1985-06-15'),
      gender: 'male',
      phone: '+1-555-1001',
      email: 'john.smith@email.com',
      address: { street: '123 Main St', city: 'Springfield', state: 'IL', zipCode: '62701' },
      bloodType: 'O+',
      allergies: ['Penicillin'],
      medicalHistory: 'Hypertension, controlled with medication',
      createdBy: users[0]._id,
    },
    {
      name: 'Mary Johnson',
      dateOfBirth: new Date('1992-03-22'),
      gender: 'female',
      phone: '+1-555-1002',
      email: 'mary.johnson@email.com',
      address: { street: '456 Oak Ave', city: 'Springfield', state: 'IL', zipCode: '62702' },
      bloodType: 'A+',
      allergies: [],
      medicalHistory: 'No significant medical history',
      createdBy: users[0]._id,
    },
    {
      name: 'Robert Davis',
      dateOfBirth: new Date('1978-11-08'),
      gender: 'male',
      phone: '+1-555-1003',
      email: 'robert.davis@email.com',
      bloodType: 'B-',
      allergies: ['Latex', 'Aspirin'],
      medicalHistory: 'Diabetes Type 2',
      createdBy: users[4]._id,
    },
    {
      name: 'Emma Wilson',
      dateOfBirth: new Date('2001-07-30'),
      gender: 'female',
      phone: '+1-555-1004',
      email: 'emma.wilson@email.com',
      bloodType: 'AB+',
      allergies: [],
      createdBy: users[4]._id,
    },
    {
      name: 'James Brown',
      dateOfBirth: new Date('1965-02-14'),
      gender: 'male',
      phone: '+1-555-1005',
      bloodType: 'O-',
      allergies: ['Codeine'],
      medicalHistory: 'Heart disease, on blood thinners',
      createdBy: users[0]._id,
    },
  ]);

  console.log('✅ Patients created:', patients.length);

  console.log('\n🎉 Database seeded successfully!\n');
  console.log('Demo Credentials:');
  console.log('─────────────────────────────────────');
  console.log('Admin:        admin@denticare.com / admin123');
  console.log('Dentist:      dentist1@denticare.com / dentist123');
  console.log('Receptionist: receptionist@denticare.com / reception123');
  console.log('─────────────────────────────────────');

  process.exit(0);
};

seedData().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
