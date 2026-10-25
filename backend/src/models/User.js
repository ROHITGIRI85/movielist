const mongoose = require('mongoose');
const { ROLES, ROLE_VALUES } = require('../constants/roles');

const refreshSessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true },
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      match: /^\+[1-9]\d{7,14}$/,
    },
    phoneVerifiedAt: {
      type: Date,
      default: null,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ROLE_VALUES,
      default: ROLES.CUSTOMER,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    refreshSessions: {
      type: [refreshSessionSchema],
      select: false,
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(document, returned) {
        delete returned.passwordHash;
        delete returned.refreshSessions;
        delete returned.__v;
        returned.id = returned._id.toString();
        delete returned._id;
        return returned;
      },
    },
  },
);

module.exports = mongoose.model('User', userSchema);

