const MedicalRecord = require('../models/MedicalRecord');
const { createAuditLog } = require('../utils/auditLogger');
const path = require('path');
const fs = require('fs');

// @desc    Get all medical records
// @route   GET /api/medical-records
// @access  Private
const getMedicalRecords = async (req, res) => {
  try {
    const { patient, dentist, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (patient) filter.patient = patient;
    if (dentist) filter.dentist = dentist;

    if (req.user.role === 'dentist') {
      filter.dentist = req.user._id;
    }

    const total = await MedicalRecord.countDocuments(filter);
    const records = await MedicalRecord.find(filter)
      .sort({ visitDate: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('patient', 'name patientId')
      .populate('dentist', 'name')
      .populate('appointment', 'appointmentId startTime type');

    res.json({ records, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single medical record
// @route   GET /api/medical-records/:id
// @access  Private
const getMedicalRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id)
      .populate('patient', 'name patientId dateOfBirth allergies bloodType')
      .populate('dentist', 'name email specialization')
      .populate('appointment', 'appointmentId startTime type status');

    if (!record) {
      return res.status(404).json({ message: 'Medical record not found' });
    }

    res.json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create medical record
// @route   POST /api/medical-records
// @access  Dentist, Admin
const createMedicalRecord = async (req, res) => {
  try {
    const recordData = {
      ...req.body,
      dentist: req.user.role === 'dentist' ? req.user._id : req.body.dentist,
      createdBy: req.user._id,
    };

    // Handle file attachments
    if (req.files && req.files.length > 0) {
      recordData.attachments = req.files.map((file) => ({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        description: '',
      }));
    }

    const record = await MedicalRecord.create(recordData);
    const populated = await MedicalRecord.findById(record._id)
      .populate('patient', 'name patientId')
      .populate('dentist', 'name');

    await createAuditLog({
      user: req.user,
      action: 'create',
      resource: 'MedicalRecord',
      resourceId: record._id,
      details: { recordId: record.recordId },
      req,
    });

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update medical record
// @route   PUT /api/medical-records/:id
// @access  Dentist, Admin
const updateMedicalRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('patient', 'name patientId')
      .populate('dentist', 'name');

    if (!record) {
      return res.status(404).json({ message: 'Medical record not found' });
    }

    await createAuditLog({
      user: req.user,
      action: 'update',
      resource: 'MedicalRecord',
      resourceId: record._id,
      req,
    });

    res.json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload attachment to medical record
// @route   POST /api/medical-records/:id/attachments
// @access  Dentist, Admin
const uploadAttachment = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const attachments = req.files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      description: req.body.description || '',
    }));

    const record = await MedicalRecord.findByIdAndUpdate(
      req.params.id,
      { $push: { attachments: { $each: attachments } } },
      { new: true }
    );

    if (!record) {
      return res.status(404).json({ message: 'Medical record not found' });
    }

    await createAuditLog({
      user: req.user,
      action: 'upload',
      resource: 'MedicalRecord',
      resourceId: record._id,
      details: { files: attachments.map((a) => a.originalName) },
      req,
    });

    res.json(record.attachments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete medical record
// @route   DELETE /api/medical-records/:id
// @access  Admin
const deleteMedicalRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findByIdAndDelete(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Medical record not found' });
    }

    // Delete associated files
    for (const attachment of record.attachments) {
      const filePath = path.join(__dirname, '../uploads', attachment.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await createAuditLog({
      user: req.user,
      action: 'delete',
      resource: 'MedicalRecord',
      resourceId: record._id,
      req,
    });

    res.json({ message: 'Medical record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMedicalRecords,
  getMedicalRecord,
  createMedicalRecord,
  updateMedicalRecord,
  uploadAttachment,
  deleteMedicalRecord,
};
