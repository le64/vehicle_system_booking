const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { registerValidator, loginValidator } = require('../validators/auth.validator');

// Routes publiques
router.post('/register', registerValidator, authController.register);
router.post('/login', loginValidator, authController.login);

// Route protégée
router.get('/me', authenticate, authController.me);

module.exports = router;