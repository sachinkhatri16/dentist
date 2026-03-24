const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getMedicalRecords,
  getMedicalRecord,
  createMedicalRecord,
  updateMedicalRecord,
  uploadAttachment,
  deleteMedicalRecord,
} = require('../controllers/medicalRecordController');

router.get('/', auth, getMedicalRecords);
router.get('/:id', auth, getMedicalRecord);
router.post('/', auth, authorize('admin', 'dentist'), upload.array('attachments', 5), createMedicalRecord);
router.put('/:id', auth, authorize('admin', 'dentist'), updateMedicalRecord);
router.post('/:id/attachments', auth, authorize('admin', 'dentist'), upload.array('files', 5), uploadAttachment);
router.delete('/:id', auth, authorize('admin'), deleteMedicalRecord);

module.exports = router;
