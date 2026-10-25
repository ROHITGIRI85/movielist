const mongoose = require('mongoose');

const cinemaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    slug: { type: String, required: true, unique: true, index: true, trim: true, lowercase: true },
    address: {
      line1: { type: String, required: true, trim: true, maxlength: 160 },
      line2: { type: String, trim: true, maxlength: 160 },
      city: { type: String, required: true, trim: true, maxlength: 80, index: true },
      state: { type: String, required: true, trim: true, maxlength: 80 },
      postalCode: { type: String, required: true, trim: true, maxlength: 20 },
      country: { type: String, required: true, trim: true, maxlength: 80, default: 'India' },
    },
    location: {
      type: { type: String, enum: ['Point'] },
      coordinates: {
        type: [Number],
        validate: {
          validator: (coordinates) => !coordinates?.length || coordinates.length === 2,
          message: 'Location coordinates must contain longitude and latitude.',
        },
      },
    },
    timezone: { type: String, required: true, trim: true, default: 'Asia/Kolkata' },
    contact: {
      phone: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true },
    },
    amenities: { type: [String], default: [] },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

cinemaSchema.index({ location: '2dsphere' }, { sparse: true });
cinemaSchema.index({ 'address.city': 1, isActive: 1, name: 1 });

module.exports = mongoose.model('Cinema', cinemaSchema);

