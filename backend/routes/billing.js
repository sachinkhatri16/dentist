const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} = require('../controllers/billingController');

router.get('/', auth, authorize('admin', 'receptionist'), getInvoices);
router.get('/:id', auth, authorize('admin', 'receptionist'), getInvoice);
router.post('/', auth, authorize('admin', 'receptionist'), createInvoice);
router.put('/:id', auth, authorize('admin', 'receptionist'), updateInvoice);
router.delete('/:id', auth, authorize('admin'), deleteInvoice);

module.exports = router;
