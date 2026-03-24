const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} = require('../controllers/appointmentController');

router.get('/', auth, getAppointments);
router.get('/:id', auth, getAppointment);
router.post('/', auth, authorize('admin', 'receptionist'), createAppointment);
router.put('/:id', auth, authorize('admin', 'receptionist', 'dentist'), updateAppointment);
router.delete('/:id', auth, authorize('admin'), deleteAppointment);

module.exports = router;
