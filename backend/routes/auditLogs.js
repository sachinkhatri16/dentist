const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const AuditLog = require('../models/AuditLog');

// @desc    Get audit logs
// @route   GET /api/audit-logs
// @access  Admin
router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { user, action, resource, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (user) filter.user = user;
    if (action) filter.action = action;
    if (resource) filter.resource = resource;

    const total = await AuditLog.countDocuments(filter);
    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('user', 'name email role');

    res.json({ logs, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
