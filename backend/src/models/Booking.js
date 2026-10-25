const mongoose = require('mongoose');
const { SEAT_CATEGORIES } = require('../constants/catalogue');
const { BOOKING_STATUS, BOOKING_STATUS_VALUES, PAYMENT_STATUS, PAYMENT_STATUS_VALUES } = require('../constants/booking');

const bookedSeatSchema = new mongoose.Schema(
  {
    seatId: { type: mongoose.Schema.Types.ObjectId, required: true },
    label: { type: String, required: true },
    row: { type: String, required: true },
    number: { type: Number, required: true },
    category: { type: String, required: true, enum: SEAT_CATEGORIES },
    amount: { type: Number, required: true, min: 0, validate: Number.isInteger },
  },
  { _id: false },
);

const paymentSchema = new mongoose.Schema(
  {
    provider: { type: String, default: 'simulated' },
    status: { type: String, enum: PAYMENT_STATUS_VALUES, default: PAYMENT_STATUS.PENDING },
    transactionReference: { type: String, default: null },
    processedAt: { type: Date, default: null },
  },
  { _id: false },
);

const bookingSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    show: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true, index: true },
    holdToken: { type: String, required: true, unique: true, select: false },
    status: { type: String, enum: BOOKING_STATUS_VALUES, default: BOOKING_STATUS.HELD, index: true },
    seats: { type: [bookedSeatSchema], required: true },
    subtotal: { type: Number, required: true, min: 0, validate: Number.isInteger },
    fees: { type: Number, required: true, min: 0, validate: Number.isInteger, default: 0 },
    total: { type: Number, required: true, min: 0, validate: Number.isInteger },
    currency: { type: String, required: true, uppercase: true, minlength: 3, maxlength: 3 },
    holdExpiresAt: { type: Date, required: true, index: true },
    confirmedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    expiredAt: { type: Date, default: null },
    payment: { type: paymentSchema, default: () => ({}) },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_document, result) => {
        delete result.holdToken;
        delete result.__v;
        return result;
      },
    },
  },
);

bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ status: 1, createdAt: -1 });
bookingSchema.index({ createdAt: -1 });

bookingSchema.pre('validate', function validateAmounts(next) {
  if (!this.seats?.length) this.invalidate('seats', 'At least one seat is required.');
  if (this.total !== this.subtotal + this.fees) this.invalidate('total', 'Total must equal subtotal plus fees.');
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
