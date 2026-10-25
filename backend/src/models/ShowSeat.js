const mongoose = require('mongoose');
const { SEAT_CATEGORIES } = require('../constants/catalogue');
const { SEAT_STATUS, SEAT_STATUS_VALUES } = require('../constants/booking');

const showSeatSchema = new mongoose.Schema(
  {
    show: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true, index: true },
    seatId: { type: mongoose.Schema.Types.ObjectId, required: true },
    label: { type: String, required: true, trim: true, uppercase: true },
    row: { type: String, required: true, trim: true, uppercase: true },
    number: { type: Number, required: true, min: 1 },
    category: { type: String, required: true, enum: SEAT_CATEGORIES },
    amount: { type: Number, required: true, min: 0, validate: Number.isInteger },
    currency: { type: String, required: true, uppercase: true, minlength: 3, maxlength: 3 },
    status: { type: String, enum: SEAT_STATUS_VALUES, default: SEAT_STATUS.AVAILABLE, index: true },
    holdToken: { type: String, default: null, index: true },
    holdOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    holdExpiresAt: { type: Date, default: null, index: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null, index: true },
  },
  { timestamps: true },
);

showSeatSchema.index({ show: 1, seatId: 1 }, { unique: true });
showSeatSchema.index({ show: 1, status: 1 });
showSeatSchema.index({ status: 1, holdExpiresAt: 1 });

module.exports = mongoose.model('ShowSeat', showSeatSchema);
