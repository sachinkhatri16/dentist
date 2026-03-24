const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
  getDashboardStats,
  getAppointmentStats,
  getRevenueReport,
  getDentistWorkload,
} = require('../controllers/reportController');

router.get('/dashboard', auth, getDashboardStats);
router.get('/appointments', auth, authorize('admin', 'receptionist'), getAppointmentStats);
router.get('/revenue', auth, authorize('admin'), getRevenueReport);
router.get('/dentist-workload', auth, authorize('admin'), getDentistWorkload);

module.exports = router;
