const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { createAuditLog } = require('../utils/auditLogger');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public (or Admin only for non-patient roles)
const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, specialization, licenseNumber } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'patient',
      phone,
      specialization,
      licenseNumber,
    });

    await createAuditLog({
      user,
      action: 'create',
      resource: 'User',
      resourceId: user._id,
      details: { email, role: user.role },
      req,
    });

    const token = generateToken(user._id);
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      await createAuditLog({
        action: 'login_failed',
        resource: 'Auth',
        details: { email },
        req,
        status: 'failure',
      });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await createAuditLog({
        user,
        action: 'login_failed',
        resource: 'Auth',
        details: { email },
        req,
        status: 'failure',
      });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated. Contact administrator.' });
    }

    user.lastLogin = new Date();
    await user.save();

    await createAuditLog({
      user,
      action: 'login',
      resource: 'Auth',
      details: { email },
      req,
    });

    const token = generateToken(user._id);
    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update password
// @route   PUT /api/auth/password
// @access  Private
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    await createAuditLog({
      user,
      action: 'password_change',
      resource: 'Auth',
      req,
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (admin)
// @route   GET /api/auth/users
// @access  Admin
const getUsers = async (req, res) => {
  try {
    const { role, isActive, search } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user (admin)
// @route   PUT /api/auth/users/:id
// @access  Admin
const updateUser = async (req, res) => {
  try {
    const { name, email, role, phone, isActive, specialization, licenseNumber } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, phone, isActive, specialization, licenseNumber },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await createAuditLog({
      user: req.user,
      action: 'update',
      resource: 'User',
      resourceId: user._id,
      details: { updated: req.body },
      req,
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user (admin)
// @route   DELETE /api/auth/users/:id
// @access  Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await createAuditLog({
      user: req.user,
      action: 'delete',
      resource: 'User',
      resourceId: user._id,
      req,
    });

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, getMe, updatePassword, getUsers, updateUser, deleteUser };
