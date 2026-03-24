const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: String,
      unique: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient is required'],
    },
    dentist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Dentist is required'],
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
    },
    status: {
      type: String,
      enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
      default: 'scheduled',
    },
    type: {
      type: String,
      enum: [
        'checkup',
        'cleaning',
        'filling',
        'extraction',
        'root-canal',
        'crown',
        'bridge',
        'implant',
        'orthodontics',
        'whitening',
        'emergency',
        'consultation',
        'other',
      ],
      default: 'checkup',
    },
    reason: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      default: '',
    },
    room: {
      type: String,
      trim: true,
    },
    cancelledAt: {
      type: Date,
    },
    cancellationReason: {
      type: String,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Auto-generate appointmentId
appointmentSchema.pre('save', async function (next) {
  if (!this.appointmentId) {
    const count = await mongoose.model('Appointment').countDocuments();
    this.appointmentId = `APT${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Index for conflict checking
appointmentSchema.index({ dentist: 1, startTime: 1, endTime: 1 });
appointmentSchema.index({ patient: 1, startTime: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
