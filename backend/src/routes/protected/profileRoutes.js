const express = require('express');
const profileController = require('../../controllers/users/profileController');
const authenticate = require('../../middleware/auth/authenticate');
const validate = require('../../middleware/validation/validate');
const { validateProfileUpdate } = require('../../validators/auth/authValidators');

const router = express.Router();

router.use(authenticate);
router.get('/', profileController.getProfile);
router.patch('/', validate(validateProfileUpdate), profileController.updateProfile);

module.exports = router;

