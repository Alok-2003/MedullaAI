const { check } = require('express-validator');

exports.validateRegistration = [
  check('name', 'Name is required').not().isEmpty().trim(),
  check('email', 'Please include a valid email').isEmail().normalizeEmail(),
  check('password', 'Password must be at least 6 characters').isLength({ min: 6 })
];

exports.validateLogin = [
  check('email', 'Please include a valid email').isEmail().normalizeEmail(),
  check('password', 'Password is required').exists()
];

exports.validateEmailVerification = [
  check('email', 'Please include a valid email').isEmail().normalizeEmail(),
  check('otp', 'OTP must be 6 digits').isLength({ min: 6, max: 6 }).isNumeric()
];

exports.validateResendOTP = [
  check('email', 'Please include a valid email').isEmail().normalizeEmail()
];
