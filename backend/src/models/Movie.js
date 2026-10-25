const mongoose = require('mongoose');
const { MOVIE_STATUS, MOVIE_STATUS_VALUES } = require('../constants/catalogue');

const personSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    role: { type: String, trim: true, maxlength: 100 },
  },
  { _id: false },
);

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 1, maxlength: 160 },
    slug: { type: String, required: true, unique: true, index: true, trim: true, lowercase: true },
    synopsis: { type: String, required: true, trim: true, minlength: 10, maxlength: 3000 },
    runtimeMinutes: { type: Number, required: true, min: 1, max: 600 },
    releaseDate: { type: Date, required: true, index: true },
    languages: { type: [String], required: true, default: [] },
    genres: { type: [String], required: true, default: [], index: true },
    cast: { type: [personSchema], default: [] },
    crew: { type: [personSchema], default: [] },
    certification: { type: String, trim: true, maxlength: 20 },
    posterUrl: { type: String, trim: true },
    backdropUrl: { type: String, trim: true },
    trailerUrl: { type: String, trim: true },
    averageRating: { type: Number, default: 0, min: 0, max: 5, index: true },
    reviewCount: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: MOVIE_STATUS_VALUES,
      default: MOVIE_STATUS.DRAFT,
      index: true,
    },
  },
  { timestamps: true },
);

movieSchema.index({ title: 'text', synopsis: 'text', 'cast.name': 'text' });
movieSchema.index({ status: 1, releaseDate: -1 });

module.exports = mongoose.model('Movie', movieSchema);

