const mongoose = require('mongoose');
const Booking = require('../../models/Booking');
const Show = require('../../models/Show');
const ShowSeat = require('../../models/ShowSeat');
const ApiError = require('../../utils/ApiError');
const { getPagination, paginationMeta } = require('../../utils/pagination');
const { createBookingReference, createHoldToken } = require('../../utils/bookingReference');
const { releaseExpiredHolds } = require('../inventory/inventoryService');
const { SHOW_STATUS } = require('../../constants/catalogue');
const { ROLES } = require('../../constants/roles');
const { BOOKING_STATUS, PAYMENT_STATUS, SEAT_STATUS } = require('../../constants/booking');

const HOLD_DURATION_MS = 5 * 60 * 1000;

const assertObjectId = (id, label) => {
  if (!mongoose.isValidObjectId(id)) throw new ApiError(400, 'INVALID_IDENTIFIER', `${label} identifier is invalid.`);
};

const releaseToken = (holdToken) => ShowSeat.updateMany(
  { holdToken, status: SEAT_STATUS.HELD },
  { $set: { status: SEAT_STATUS.AVAILABLE, holdToken: null, holdOwner: null, holdExpiresAt: null, booking: null } },
);

const expireBookings = async ({ now = new Date() } = {}) => {
  const expired = await Booking.find({ status: BOOKING_STATUS.HELD, holdExpiresAt: { $lte: now } }).select('+holdToken');
  if (!expired.length) return 0;
  await Promise.all(expired.map((booking) => releaseToken(booking.holdToken)));
  await Booking.updateMany(
    { _id: { $in: expired.map((booking) => booking._id) }, status: BOOKING_STATUS.HELD },
    { $set: { status: BOOKING_STATUS.EXPIRED, expiredAt: now } },
  );
  return expired.length;
};

const assertShowBookable = (show, now) => {
  if (!show || show.status !== SHOW_STATUS.SCHEDULED) throw new ApiError(404, 'SHOW_NOT_FOUND', 'Show was not found.');
  if (show.startAt <= now) throw new ApiError(409, 'BOOKING_CLOSED', 'This show has already started.');
  if (show.bookingOpensAt && show.bookingOpensAt > now) throw new ApiError(409, 'BOOKING_NOT_OPEN', 'Booking is not open yet.');
  if (show.bookingClosesAt && show.bookingClosesAt <= now) throw new ApiError(409, 'BOOKING_CLOSED', 'Booking is closed for this show.');
};

const createHold = async ({ userId, showId, seatIds, now = new Date() }) => {
  const show = await Show.findById(showId);
  assertShowBookable(show, now);
  await releaseExpiredHolds({ showId, now });

  const requestedSeats = await ShowSeat.find({ show: showId, seatId: { $in: seatIds } });
  if (requestedSeats.length !== seatIds.length) throw new ApiError(422, 'INVALID_SHOW_SEATS', 'One or more seats do not belong to this show.');
  const currencies = new Set(requestedSeats.map((seat) => seat.currency));
  if (currencies.size !== 1) throw new ApiError(500, 'INCONSISTENT_PRICING', 'Show seat pricing is inconsistent.');

  const holdToken = createHoldToken();
  const holdExpiresAt = new Date(now.getTime() + HOLD_DURATION_MS);
  const acquired = [];
  const orderedSeatIds = [...seatIds].sort();
  try {
    for (const seatId of orderedSeatIds) {
      const seat = await ShowSeat.findOneAndUpdate(
        { show: showId, seatId, status: SEAT_STATUS.AVAILABLE },
        { $set: { status: SEAT_STATUS.HELD, holdToken, holdOwner: userId, holdExpiresAt } },
        { new: true },
      );
      if (!seat) throw new ApiError(409, 'SEATS_UNAVAILABLE', 'One or more selected seats are no longer available.');
      acquired.push(seat);
    }

    const subtotal = acquired.reduce((sum, seat) => sum + seat.amount, 0);
    const booking = await Booking.create({
      reference: createBookingReference(),
      user: userId,
      show: showId,
      holdToken,
      status: BOOKING_STATUS.HELD,
      seats: acquired.map(({ seatId, label, row, number, category, amount }) => ({ seatId, label, row, number, category, amount })),
      subtotal,
      fees: 0,
      total: subtotal,
      currency: acquired[0].currency,
      holdExpiresAt,
    });
    await ShowSeat.updateMany({ holdToken }, { $set: { booking: booking._id } });
    return booking;
  } catch (error) {
    await releaseToken(holdToken);
    throw error;
  }
};

const hasAccess = (booking, actor) => actor.role === ROLES.ADMIN || booking.user.toString() === actor.id;

const getBooking = async (bookingId, actor, { includeToken = false } = {}) => {
  assertObjectId(bookingId, 'Booking');
  let query = Booking.findById(bookingId);
  if (includeToken) query = query.select('+holdToken');
  const booking = await query.populate({ path: 'show', populate: ['movie', 'cinema', 'screen'] });
  if (!booking || !hasAccess(booking, actor)) throw new ApiError(404, 'BOOKING_NOT_FOUND', 'Booking was not found.');
  if (booking.status === BOOKING_STATUS.HELD && booking.holdExpiresAt <= new Date()) {
    await ShowSeat.updateMany(
      { booking: booking._id, status: SEAT_STATUS.HELD },
      { $set: { status: SEAT_STATUS.AVAILABLE, holdToken: null, holdOwner: null, holdExpiresAt: null, booking: null } },
    );
    booking.status = BOOKING_STATUS.EXPIRED;
    booking.expiredAt = new Date();
    await booking.save();
  }
  return booking;
};

const confirmBooking = async ({ bookingId, actor, paymentResult, transactionReference, now = new Date() }) => {
  const existing = await getBooking(bookingId, actor, { includeToken: true });
  if (existing.status === BOOKING_STATUS.EXPIRED) throw new ApiError(409, 'HOLD_EXPIRED', 'The seat hold has expired.');
  if (existing.status !== BOOKING_STATUS.HELD) throw new ApiError(409, 'INVALID_BOOKING_STATE', 'Only a held booking can be confirmed.');

  if (paymentResult === 'failure') {
    await releaseToken(existing.holdToken);
    existing.status = BOOKING_STATUS.CANCELLED;
    existing.cancelledAt = now;
    existing.payment = { provider: 'simulated', status: PAYMENT_STATUS.FAILED, transactionReference: transactionReference || null, processedAt: now };
    await existing.save();
    throw new ApiError(402, 'PAYMENT_FAILED', 'The simulated payment failed and the seats were released.');
  }

  const booking = await Booking.findOneAndUpdate(
    { _id: existing._id, status: BOOKING_STATUS.HELD, holdExpiresAt: { $gt: now } },
    { $set: {
      status: BOOKING_STATUS.CONFIRMED,
      confirmedAt: now,
      payment: { provider: 'simulated', status: PAYMENT_STATUS.PAID, transactionReference: transactionReference || `SIM-${existing.reference}`, processedAt: now },
    } },
    { new: true },
  );
  if (!booking) throw new ApiError(409, 'HOLD_EXPIRED', 'The seat hold has expired or changed.');
  const seats = await ShowSeat.updateMany(
    { booking: booking._id, holdToken: existing.holdToken, status: SEAT_STATUS.HELD, holdExpiresAt: { $gt: now } },
    { $set: { status: SEAT_STATUS.BOOKED, holdToken: null, holdOwner: null, holdExpiresAt: null } },
  );
  if (seats.modifiedCount !== booking.seats.length) {
    await Booking.updateOne({ _id: booking._id }, { $set: { status: BOOKING_STATUS.HELD, confirmedAt: null, payment: { provider: 'simulated', status: PAYMENT_STATUS.PENDING } } });
    throw new ApiError(409, 'HOLD_EXPIRED', 'The complete seat hold is no longer valid.');
  }
  return booking;
};

const cancelBooking = async ({ bookingId, actor, now = new Date() }) => {
  const booking = await getBooking(bookingId, actor, { includeToken: true });
  if (![BOOKING_STATUS.HELD, BOOKING_STATUS.CONFIRMED].includes(booking.status)) {
    throw new ApiError(409, 'INVALID_BOOKING_STATE', 'This booking cannot be cancelled.');
  }
  if (booking.show.startAt <= now) throw new ApiError(409, 'CANCELLATION_CLOSED', 'A started show cannot be cancelled.');
  if (booking.status === BOOKING_STATUS.HELD) await releaseToken(booking.holdToken);
  else {
    await ShowSeat.updateMany(
      { booking: booking._id, status: SEAT_STATUS.BOOKED },
      { $set: { status: SEAT_STATUS.AVAILABLE, booking: null } },
    );
  }
  booking.status = BOOKING_STATUS.CANCELLED;
  booking.cancelledAt = now;
  await booking.save();
  return booking;
};

const listBookings = async (query, actor, { admin = false } = {}) => {
  await expireBookings();
  const { page, limit, skip } = getPagination(query);
  const filter = admin ? {} : { user: actor._id };
  if (query.status) filter.status = query.status;
  if (admin && query.userId) { assertObjectId(query.userId, 'User'); filter.user = query.userId; }
  if (query.showId) { assertObjectId(query.showId, 'Show'); filter.show = query.showId; }
  if (query.reference) filter.reference = query.reference.toUpperCase();
  const [items, total] = await Promise.all([
    Booking.find(filter).populate({ path: 'show', populate: ['movie', 'cinema', 'screen'] }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Booking.countDocuments(filter),
  ]);
  return { items, meta: paginationMeta({ page, limit, total }) };
};

module.exports = { HOLD_DURATION_MS, createHold, confirmBooking, cancelBooking, getBooking, listBookings, expireBookings };
