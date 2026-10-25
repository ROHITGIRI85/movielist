const mongoose = require('mongoose');
const { SEAT_CATEGORIES } = require('../constants/catalogue');

const seatSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true, uppercase: true, maxlength: 12 },
    row: { type: String, required: true, trim: true, uppercase: true, maxlength: 5 },
    number: { type: Number, required: true, min: 1, max: 999 },
    category: { type: String, required: true, enum: SEAT_CATEGORIES, default: 'standard' },
    isAccessible: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { _id: true },
);

const screenSchema = new mongoose.Schema(
  {
    cinema: { type: mongoose.Schema.Types.ObjectId, ref: 'Cinema', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    seats: {
      type: [seatSchema],
      required: true,
      validate: {
        validator: (seats) => seats.length > 0 && seats.length <= 500,
        message: 'A screen must contain between 1 and 500 seats.',
      },
    },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

screenSchema.index({ cinema: 1, name: 1 }, { unique: true });

screenSchema.pre('validate', function validateUniqueSeats(next) {
  const labels = this.seats.map((seat) => seat.label.toUpperCase());
  const positions = this.seats.map((seat) => `${seat.row.toUpperCase()}:${seat.number}`);
  if (new Set(labels).size !== labels.length || new Set(positions).size !== positions.length) {
    this.invalidate('seats', 'Seat labels and row/number positions must be unique within a screen.');
  }
  next();
});

module.exports = mongoose.model('Screen', screenSchema);

