const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  verifyEmail, 
  loginUser, 
  resendOTP, 
  getUserProfile 
} = require('../controllers/authController');
const { 
  validateRegistration, 
  validateLogin, 
  validateEmailVerification, 
  validateResendOTP 
} = require('../middleware/validationMiddleware');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', validateRegistration, registerUser);
router.post('/verify-email', validateEmailVerification, verifyEmail);
router.post('/login', validateLogin, loginUser);
router.post('/resend-otp', validateResendOTP, resendOTP);

// Protected routes
router.get('/me', protect, getUserProfile);

module.exports = router;
