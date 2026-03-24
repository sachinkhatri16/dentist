const User = require('../models/User');
const Schedule = require('../models/Schedule');
const Appointment = require('../models/Appointment');
const { createAuditLog } = require('../utils/auditLogger');

// @desc    Get all dentists
// @route   GET /api/dentists
// @access  Private
const getDentists = async (req, res) => {
  try {
    const { search, isActive } = req.query;
    const filter = { role: 'dentist' };

    if (isActive !== undefined) filter.isActive = isActive === 'true';
    else filter.isActive = true;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
      ];
    }

    const dentists = await User.find(filter).sort({ name: 1 });
    res.json(dentists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dentist schedule
// @route   GET /api/dentists/:id/schedule
// @access  Private
const getDentistSchedule = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = { dentist: req.params.id };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const schedules = await Schedule.find(filter).sort({ date: 1 });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create/update dentist schedule
// @route   POST /api/dentists/:id/schedule
// @access  Admin, Receptionist
const upsertSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findOneAndUpdate(
      { dentist: req.params.id, date: new Date(req.body.date) },
      { ...req.body, dentist: req.params.id, createdBy: req.user._id },
      { upsert: true, new: true, runValidators: true }
    );

    await createAuditLog({
      user: req.user,
      action: 'update',
      resource: 'Schedule',
      resourceId: schedule._id,
      details: { dentist: req.params.id, date: req.body.date },
      req,
    });

    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dentist today's appointments
// @route   GET /api/dentists/:id/today
// @access  Private
const getDentistTodayAppointments = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await Appointment.find({
      dentist: req.params.id,
      startTime: { $gte: today, $lt: tomorrow },
      status: { $ne: 'cancelled' },
    })
      .sort({ startTime: 1 })
      .populate('patient', 'name patientId phone email');

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDentists, getDentistSchedule, upsertSchedule, getDentistTodayAppointments };
