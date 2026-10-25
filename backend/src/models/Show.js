const mongoose = require('mongoose');
const { SHOW_FORMATS, SHOW_STATUS, SHOW_STATUS_VALUES, SEAT_CATEGORIES } = require('../constants/catalogue');

const priceSchema = new mongoose.Schema(
  {
    category: { type: String, required: true, enum: SEAT_CATEGORIES },
    amount: { type: Number, required: true, min: 0, validate: Number.isInteger },
    currency: { type: String, required: true, trim: true, uppercase: true, minlength: 3, maxlength: 3 },
  },
  { _id: false },
);

const showSchema = new mongoose.Schema(
  {
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true, index: true },
    cinema: { type: mongoose.Schema.Types.ObjectId, ref: 'Cinema', required: true, index: true },
    screen: { type: mongoose.Schema.Types.ObjectId, ref: 'Screen', required: true, index: true },
    startAt: { type: Date, required: true, index: true },
    endAt: { type: Date, required: true },
    language: { type: String, required: true, trim: true, maxlength: 40, index: true },
    format: { type: String, required: true, enum: SHOW_FORMATS, default: '2D' },
    pricing: { type: [priceSchema], required: true },
    bookingOpensAt: { type: Date },
    bookingClosesAt: { type: Date },
    status: { type: String, enum: SHOW_STATUS_VALUES, default: SHOW_STATUS.SCHEDULED, index: true },
  },
  { timestamps: true },
);

showSchema.index({ movie: 1, startAt: 1, status: 1 });
showSchema.index({ cinema: 1, startAt: 1, status: 1 });
showSchema.index({ screen: 1, startAt: 1, endAt: 1, status: 1 });

showSchema.pre('validate', function validateShow(next) {
  if (this.startAt && this.endAt && this.endAt <= this.startAt) {
    this.invalidate('endAt', 'Show end time must be later than its start time.');
  }
  if (!this.pricing?.length) {
    this.invalidate('pricing', 'At least one seat-category price is required.');
  } else {
    const categories = this.pricing.map((price) => price.category);
    if (new Set(categories).size !== categories.length) {
      this.invalidate('pricing', 'Each seat category can have only one price.');
    }
  }
  if (this.bookingOpensAt && this.bookingClosesAt && this.bookingClosesAt <= this.bookingOpensAt) {
    this.invalidate('bookingClosesAt', 'Booking close time must be later than opening time.');
  }
  next();
});

module.exports = mongoose.model('Show', showSchema);

