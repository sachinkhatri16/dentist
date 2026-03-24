const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema(
  {
    dentist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Dentist is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    dayOfWeek: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    workingHours: {
      start: { type: String, default: '09:00' }, // HH:MM
      end: { type: String, default: '17:00' },
    },
    breaks: [
      {
        start: String,
        end: String,
        reason: String,
      },
    ],
    type: {
      type: String,
      enum: ['regular', 'leave', 'holiday', 'emergency'],
      default: 'regular',
    },
    leaveReason: {
      type: String,
    },
    room: {
      type: String,
    },
    maxAppointments: {
      type: Number,
      default: 8,
    },
    notes: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

scheduleSchema.index({ dentist: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Schedule', scheduleSchema);
