const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
  getDentists,
  getDentistSchedule,
  upsertSchedule,
  getDentistTodayAppointments,
} = require('../controllers/dentistController');

router.get('/', auth, getDentists);
router.get('/:id/schedule', auth, getDentistSchedule);
router.post('/:id/schedule', auth, authorize('admin', 'receptionist'), upsertSchedule);
router.get('/:id/today', auth, getDentistTodayAppointments);

module.exports = router;
