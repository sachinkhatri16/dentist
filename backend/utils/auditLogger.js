const AuditLog = require('../models/AuditLog');

const createAuditLog = async ({ user, action, resource, resourceId, details, req, status = 'success' }) => {
  try {
    await AuditLog.create({
      user: user?._id || user,
      userEmail: user?.email,
      action,
      resource,
      resourceId: resourceId?.toString(),
      details,
      ipAddress: req?.ip || req?.connection?.remoteAddress,
      userAgent: req?.headers?.['user-agent'],
      status,
    });
  } catch (error) {
    console.error('Audit log error:', error.message);
  }
};

module.exports = { createAuditLog };
