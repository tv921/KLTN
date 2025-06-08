const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { register, login, verifyOTP } = require('../controllers/auth.controller'); 

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-otp', verifyOTP);

module.exports = router;
