const Invoice = require('../models/Invoice');
const { createAuditLog } = require('../utils/auditLogger');

// @desc    Get all invoices
// @route   GET /api/billing
// @access  Private (Admin, Receptionist)
const getInvoices = async (req, res) => {
  try {
    const { patient, status, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (patient) filter.patient = patient;
    if (status) filter.status = status;

    const total = await Invoice.countDocuments(filter);
    const invoices = await Invoice.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('patient', 'name patientId phone')
      .populate('dentist', 'name')
      .populate('appointment', 'appointmentId startTime type');

    res.json({ invoices, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single invoice
// @route   GET /api/billing/:id
// @access  Private
const getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('patient', 'name patientId phone email address')
      .populate('dentist', 'name specialization')
      .populate('appointment', 'appointmentId startTime type')
      .populate('medicalRecord', 'recordId procedures');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create invoice
// @route   POST /api/billing
// @access  Admin, Receptionist
const createInvoice = async (req, res) => {
  try {
    const { items, taxRate = 0, discountAmount = 0 } = req.body;

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = (subtotal * taxRate) / 100;
    const totalAmount = subtotal + taxAmount - discountAmount;

    const invoice = await Invoice.create({
      ...req.body,
      subtotal,
      taxAmount,
      totalAmount,
      balanceDue: totalAmount,
      createdBy: req.user._id,
    });

    const populated = await Invoice.findById(invoice._id)
      .populate('patient', 'name patientId phone')
      .populate('dentist', 'name');

    await createAuditLog({
      user: req.user,
      action: 'create',
      resource: 'Invoice',
      resourceId: invoice._id,
      details: { invoiceId: invoice.invoiceId, totalAmount },
      req,
    });

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update invoice / record payment
// @route   PUT /api/billing/:id
// @access  Admin, Receptionist
const updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const updateData = { ...req.body };

    // Recalculate if items changed
    if (req.body.items) {
      updateData.subtotal = req.body.items.reduce((sum, item) => sum + item.total, 0);
      updateData.taxAmount = (updateData.subtotal * (req.body.taxRate || invoice.taxRate)) / 100;
      updateData.totalAmount =
        updateData.subtotal +
        updateData.taxAmount -
        (req.body.discountAmount || invoice.discountAmount);
    }

    if (req.body.paidAmount !== undefined) {
      const total = updateData.totalAmount || invoice.totalAmount;
      updateData.balanceDue = total - req.body.paidAmount;
      if (updateData.balanceDue <= 0) {
        updateData.status = 'paid';
        updateData.paymentDate = new Date();
      } else if (req.body.paidAmount > 0) {
        updateData.status = 'partial';
      }
    }

    const updated = await Invoice.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('patient', 'name patientId phone')
      .populate('dentist', 'name');

    await createAuditLog({
      user: req.user,
      action: 'update',
      resource: 'Invoice',
      resourceId: invoice._id,
      details: { updated: req.body },
      req,
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete invoice
// @route   DELETE /api/billing/:id
// @access  Admin
const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    await createAuditLog({
      user: req.user,
      action: 'delete',
      resource: 'Invoice',
      resourceId: invoice._id,
      req,
    });

    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice };
