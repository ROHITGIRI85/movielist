const SEAT_STATUS = Object.freeze({
  AVAILABLE: 'available',
  HELD: 'held',
  BOOKED: 'booked',
});

const BOOKING_STATUS = Object.freeze({
  HELD: 'held',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
  REFUNDED: 'refunded',
});

const PAYMENT_STATUS = Object.freeze({
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
});

module.exports = {
  SEAT_STATUS,
  SEAT_STATUS_VALUES: Object.values(SEAT_STATUS),
  BOOKING_STATUS,
  BOOKING_STATUS_VALUES: Object.values(BOOKING_STATUS),
  PAYMENT_STATUS,
  PAYMENT_STATUS_VALUES: Object.values(PAYMENT_STATUS),
};
