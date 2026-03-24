const Appointment = require('../models/Appointment');
const Schedule = require('../models/Schedule');
const { createAuditLog } = require('../utils/auditLogger');

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res) => {
  try {
    const { dentist, patient, status, startDate, endDate, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (dentist) filter.dentist = dentist;
    if (patient) filter.patient = patient;
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.startTime = {};
      if (startDate) filter.startTime.$gte = new Date(startDate);
      if (endDate) filter.startTime.$lte = new Date(endDate);
    }

    // Dentists can only see their own appointments
    if (req.user.role === 'dentist') {
      filter.dentist = req.user._id;
    }

    const total = await Appointment.countDocuments(filter);
    const appointments = await Appointment.find(filter)
      .sort({ startTime: 1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('patient', 'name patientId phone email')
      .populate('dentist', 'name email specialization');

    res.json({ appointments, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
const getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name patientId phone email dateOfBirth')
      .populate('dentist', 'name email specialization');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create appointment (with conflict check)
// @route   POST /api/appointments
// @access  Private (Admin, Receptionist)
const createAppointment = async (req, res) => {
  try {
    const { dentist, startTime, endTime } = req.body;

    // Check for scheduling conflicts
    const conflict = await Appointment.findOne({
      dentist,
      status: { $nin: ['cancelled', 'no-show'] },
      $or: [
        { startTime: { $lt: new Date(endTime), $gte: new Date(startTime) } },
        { endTime: { $gt: new Date(startTime), $lte: new Date(endTime) } },
        { startTime: { $lte: new Date(startTime) }, endTime: { $gte: new Date(endTime) } },
      ],
    });

    if (conflict) {
      return res.status(409).json({
        message: 'Scheduling conflict: Dentist already has an appointment at this time',
        conflict,
      });
    }

    // Check dentist availability
    const startOfDay = new Date(startTime);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startTime);
    endOfDay.setHours(23, 59, 59, 999);
    const schedule = await Schedule.findOne({
      dentist,
      date: { $gte: startOfDay, $lt: endOfDay },
    });

    if (schedule && !schedule.isAvailable) {
      return res.status(409).json({
        message: 'Dentist is not available on this date (leave/holiday)',
      });
    }

    const appointment = await Appointment.create({
      ...req.body,
      createdBy: req.user._id,
    });

    const populated = await Appointment.findById(appointment._id)
      .populate('patient', 'name patientId phone')
      .populate('dentist', 'name email');

    await createAuditLog({
      user: req.user,
      action: 'create',
      resource: 'Appointment',
      resourceId: appointment._id,
      details: { appointmentId: appointment.appointmentId },
      req,
    });

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
const updateAppointment = async (req, res) => {
  try {
    const { dentist, startTime, endTime, status } = req.body;
    const appointmentId = req.params.id;

    // Check for scheduling conflicts if time/dentist is being changed
    if (dentist || startTime || endTime) {
      const existing = await Appointment.findById(appointmentId);
      const newDentist = dentist || existing.dentist;
      const newStart = startTime ? new Date(startTime) : existing.startTime;
      const newEnd = endTime ? new Date(endTime) : existing.endTime;

      const conflict = await Appointment.findOne({
        _id: { $ne: appointmentId },
        dentist: newDentist,
        status: { $nin: ['cancelled', 'no-show'] },
        $or: [
          { startTime: { $lt: newEnd, $gte: newStart } },
          { endTime: { $gt: newStart, $lte: newEnd } },
          { startTime: { $lte: newStart }, endTime: { $gte: newEnd } },
        ],
      });

      if (conflict) {
        return res.status(409).json({
          message: 'Scheduling conflict: Dentist already has an appointment at this time',
          conflict,
        });
      }
    }

    const updateData = { ...req.body };
    if (status === 'cancelled') {
      updateData.cancelledAt = new Date();
    }

    const appointment = await Appointment.findByIdAndUpdate(appointmentId, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('patient', 'name patientId phone')
      .populate('dentist', 'name email');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    await createAuditLog({
      user: req.user,
      action: 'update',
      resource: 'Appointment',
      resourceId: appointment._id,
      details: { updated: req.body },
      req,
    });

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Admin
const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    await createAuditLog({
      user: req.user,
      action: 'delete',
      resource: 'Appointment',
      resourceId: appointment._id,
      req,
    });

    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
};
