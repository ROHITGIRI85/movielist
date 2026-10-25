const express = require('express');
const authController = require('../../controllers/auth/authController');
const validate = require('../../middleware/validation/validate');
const { authRateLimit } = require('../../middleware/security/rateLimits');
const { validateRegister, validateLogin } = require('../../validators/auth/authValidators');

const router = express.Router();

router.use(authRateLimit);
router.post('/register', validate(validateRegister), authController.register);
router.post('/login', validate(validateLogin), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

module.exports = router;

