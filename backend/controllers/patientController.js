const Patient = require('../models/Patient');
const { createAuditLog } = require('../utils/auditLogger');

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private (Admin, Receptionist, Dentist)
const getPatients = async (req, res) => {
  try {
    const { search, isActive, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (isActive !== undefined) filter.isActive = isActive === 'true';
    else filter.isActive = true;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { patientId: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Patient.countDocuments(filter);
    const patients = await Patient.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('linkedUser', 'name email');

    res.json({ patients, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single patient
// @route   GET /api/patients/:id
// @access  Private
const getPatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).populate('linkedUser', 'name email');
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create patient
// @route   POST /api/patients
// @access  Private (Admin, Receptionist)
const createPatient = async (req, res) => {
  try {
    const patient = await Patient.create({ ...req.body, createdBy: req.user._id });

    await createAuditLog({
      user: req.user,
      action: 'create',
      resource: 'Patient',
      resourceId: patient._id,
      details: { patientId: patient.patientId, name: patient.name },
      req,
    });

    res.status(201).json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private (Admin, Receptionist)
const updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    await createAuditLog({
      user: req.user,
      action: 'update',
      resource: 'Patient',
      resourceId: patient._id,
      details: { updated: req.body },
      req,
    });

    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete (deactivate) patient
// @route   DELETE /api/patients/:id
// @access  Admin
const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    await createAuditLog({
      user: req.user,
      action: 'delete',
      resource: 'Patient',
      resourceId: patient._id,
      req,
    });

    res.json({ message: 'Patient deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getPatients, getPatient, createPatient, updatePatient, deletePatient };
