const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
  getPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
} = require('../controllers/patientController');

router.get('/', auth, getPatients);
router.get('/:id', auth, getPatient);
router.post('/', auth, authorize('admin', 'receptionist'), createPatient);
router.put('/:id', auth, authorize('admin', 'receptionist'), updatePatient);
router.delete('/:id', auth, authorize('admin'), deletePatient);

module.exports = router;
