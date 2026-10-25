const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, trim: true, maxlength: 2000 },
    status: { type: String, enum: ['pending', 'approved', 'hidden'], default: 'pending', index: true },
    moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    moderatedAt: { type: Date },
  },
  { timestamps: true },
);

reviewSchema.index({ user: 1, movie: 1 }, { unique: true });
reviewSchema.index({ movie: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);

