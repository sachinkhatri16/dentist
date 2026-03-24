const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Invoice = require('../models/Invoice');
const User = require('../models/User');
const MedicalRecord = require('../models/MedicalRecord');

// @desc    Get dashboard stats
// @route   GET /api/reports/dashboard
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const [
      totalPatients,
      totalDentists,
      todayAppointments,
      monthAppointments,
      pendingInvoices,
      monthRevenue,
      totalAppointments,
      recentAppointments,
    ] = await Promise.all([
      Patient.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'dentist', isActive: true }),
      Appointment.countDocuments({
        startTime: { $gte: today, $lt: tomorrow },
        status: { $ne: 'cancelled' },
      }),
      Appointment.countDocuments({
        startTime: { $gte: thisMonth, $lt: nextMonth },
        status: { $ne: 'cancelled' },
      }),
      Invoice.countDocuments({ status: { $in: ['pending', 'partial'] } }),
      Invoice.aggregate([
        {
          $match: {
            createdAt: { $gte: thisMonth, $lt: nextMonth },
            status: { $in: ['paid', 'partial'] },
          },
        },
        { $group: { _id: null, total: { $sum: '$paidAmount' } } },
      ]),
      Appointment.countDocuments(),
      Appointment.find({
        startTime: { $gte: today },
        status: { $ne: 'cancelled' },
      })
        .sort({ startTime: 1 })
        .limit(10)
        .populate('patient', 'name patientId')
        .populate('dentist', 'name'),
    ]);

    res.json({
      totalPatients,
      totalDentists,
      todayAppointments,
      monthAppointments,
      pendingInvoices,
      monthRevenue: monthRevenue[0]?.total || 0,
      totalAppointments,
      recentAppointments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get appointment statistics
// @route   GET /api/reports/appointments
// @access  Admin, Receptionist
const getAppointmentStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const match = {};

    if (startDate || endDate) {
      match.startTime = {};
      if (startDate) match.startTime.$gte = new Date(startDate);
      if (endDate) match.startTime.$lte = new Date(endDate);
    }

    const [byStatus, byType, byDentist, daily] = await Promise.all([
      Appointment.aggregate([
        { $match: match },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Appointment.aggregate([
        { $match: match },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
      Appointment.aggregate([
        { $match: match },
        { $group: { _id: '$dentist', count: { $sum: 1 } } },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'dentist',
          },
        },
        { $unwind: '$dentist' },
        { $project: { name: '$dentist.name', count: 1 } },
        { $sort: { count: -1 } },
      ]),
      Appointment.aggregate([
        { $match: match },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$startTime' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    res.json({ byStatus, byType, byDentist, daily });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get revenue report
// @route   GET /api/reports/revenue
// @access  Admin
const getRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const match = {};

    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    const [monthly, byStatus, total] = await Promise.all([
      Invoice.aggregate([
        { $match: match },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            totalBilled: { $sum: '$totalAmount' },
            totalCollected: { $sum: '$paidAmount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Invoice.aggregate([
        { $match: match },
        { $group: { _id: '$status', count: { $sum: 1 }, amount: { $sum: '$totalAmount' } } },
      ]),
      Invoice.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            totalBilled: { $sum: '$totalAmount' },
            totalCollected: { $sum: '$paidAmount' },
            totalPending: { $sum: '$balanceDue' },
          },
        },
      ]),
    ]);

    res.json({ monthly, byStatus, total: total[0] || {} });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dentist workload report
// @route   GET /api/reports/dentist-workload
// @access  Admin
const getDentistWorkload = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const match = {};

    if (startDate || endDate) {
      match.startTime = {};
      if (startDate) match.startTime.$gte = new Date(startDate);
      if (endDate) match.startTime.$lte = new Date(endDate);
    }

    const workload = await Appointment.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$dentist',
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'dentist',
        },
      },
      { $unwind: '$dentist' },
      {
        $project: {
          name: '$dentist.name',
          specialization: '$dentist.specialization',
          total: 1,
          completed: 1,
          cancelled: 1,
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.json(workload);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats, getAppointmentStats, getRevenueReport, getDentistWorkload };
