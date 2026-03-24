const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema(
  {
    recordId: {
      type: String,
      unique: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient is required'],
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    dentist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Dentist is required'],
    },
    visitDate: {
      type: Date,
      required: [true, 'Visit date is required'],
      default: Date.now,
    },
    chiefComplaint: {
      type: String,
      trim: true,
    },
    diagnosis: {
      type: String,
      trim: true,
    },
    procedures: [
      {
        name: { type: String, required: true },
        tooth: { type: String },
        notes: { type: String },
        cost: { type: Number, default: 0 },
      },
    ],
    prescriptions: [
      {
        medication: { type: String, required: true },
        dosage: { type: String },
        frequency: { type: String },
        duration: { type: String },
        notes: { type: String },
      },
    ],
    clinicalNotes: {
      type: String,
      default: '',
    },
    vitalSigns: {
      bloodPressure: String,
      pulse: String,
      temperature: String,
      weight: String,
    },
    attachments: [
      {
        filename: String,
        originalName: String,
        mimetype: String,
        size: Number,
        uploadedAt: { type: Date, default: Date.now },
        description: String,
      },
    ],
    followUpDate: {
      type: Date,
    },
    followUpNotes: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Auto-generate recordId
medicalRecordSchema.pre('save', async function (next) {
  if (!this.recordId) {
    const count = await mongoose.model('MedicalRecord').countDocuments();
    this.recordId = `MR${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
