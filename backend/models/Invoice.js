const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    invoiceId: {
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
    medicalRecord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicalRecord',
    },
    dentist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    items: [
      {
        description: { type: String, required: true },
        procedure: { type: String },
        tooth: { type: String },
        quantity: { type: Number, default: 1 },
        unitPrice: { type: Number, required: true },
        discount: { type: Number, default: 0 },
        total: { type: Number, required: true },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
    },
    taxRate: {
      type: Number,
      default: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    balanceDue: {
      type: Number,
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'partial', 'paid', 'overdue', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'insurance', 'online', 'other'],
    },
    paymentDate: {
      type: Date,
    },
    dueDate: {
      type: Date,
    },
    notes: {
      type: String,
    },
    insuranceClaim: {
      provider: String,
      claimNumber: String,
      amount: Number,
      status: { type: String, enum: ['pending', 'approved', 'rejected', ''] },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Auto-generate invoiceId
invoiceSchema.pre('save', async function (next) {
  if (!this.invoiceId) {
    const count = await mongoose.model('Invoice').countDocuments();
    this.invoiceId = `INV${String(count + 1).padStart(6, '0')}`;
  }
  this.balanceDue = this.totalAmount - this.paidAmount;
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);
