const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
  register,
  login,
  getMe,
  updatePassword,
  getUsers,
  updateUser,
  deleteUser,
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getMe);
router.put('/password', auth, updatePassword);
router.get('/users', auth, authorize('admin'), getUsers);
router.put('/users/:id', auth, authorize('admin'), updateUser);
router.delete('/users/:id', auth, authorize('admin'), deleteUser);

module.exports = router;
