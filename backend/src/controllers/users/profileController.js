const asyncHandler = require('../../utils/asyncHandler');

const getProfile = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: { user: req.user.toJSON() } });
});

const updateProfile = asyncHandler(async (req, res) => {
  if (Object.prototype.hasOwnProperty.call(req.validatedBody, 'name')) {
    req.user.name = req.validatedBody.name;
  }
  if (Object.prototype.hasOwnProperty.call(req.validatedBody, 'phone')) {
    req.user.phone = req.validatedBody.phone || undefined;
    req.user.phoneVerifiedAt = null;
  }
  await req.user.save();
  res.status(200).json({ success: true, data: { user: req.user.toJSON() } });
});

module.exports = { getProfile, updateProfile };
