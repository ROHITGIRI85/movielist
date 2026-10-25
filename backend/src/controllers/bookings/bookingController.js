const asyncHandler = require('../../utils/asyncHandler');
const bookingService = require('../../services/bookings/bookingService');

const createHold = asyncHandler(async (req, res) => {
  const booking = await bookingService.createHold({ userId: req.user._id, ...req.validatedBody });
  res.status(201).json({ success: true, data: { booking } });
});

const confirmBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.confirmBooking({ bookingId: req.params.bookingId, actor: req.user, ...req.validatedBody });
  res.status(200).json({ success: true, data: { booking } });
});

const listBookings = asyncHandler(async (req, res) => {
  const result = await bookingService.listBookings(req.query, req.user);
  res.status(200).json({ success: true, data: { bookings: result.items }, meta: result.meta });
});

const getBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.getBooking(req.params.bookingId, req.user);
  res.status(200).json({ success: true, data: { booking } });
});

const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.cancelBooking({ bookingId: req.params.bookingId, actor: req.user });
  res.status(200).json({ success: true, data: { booking } });
});

const listAdminBookings = asyncHandler(async (req, res) => {
  const result = await bookingService.listBookings(req.query, req.user, { admin: true });
  res.status(200).json({ success: true, data: { bookings: result.items }, meta: result.meta });
});

module.exports = { createHold, confirmBooking, listBookings, getBooking, cancelBooking, listAdminBookings };
