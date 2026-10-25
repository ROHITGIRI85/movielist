const getAdminStatus = (req, res) => {
  res.status(200).json({
    success: true,
    data: { status: 'available', userId: req.user.id },
  });
};

module.exports = { getAdminStatus };

