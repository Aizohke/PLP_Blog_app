const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  validateUser,
  validateLogin,
  checkValidation,
} = require('../middleware/validation');

router.post('/register', validateUser, checkValidation, register);
router.post('/login', validateLogin, checkValidation, login);
router.get('/me', protect, getMe);

module.exports = router;