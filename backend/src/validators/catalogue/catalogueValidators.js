const { URL } = require('url');
const mongoose = require('mongoose');
const {
  MOVIE_STATUS_VALUES,
  SHOW_FORMATS,
  SHOW_STATUS_VALUES,
  SEAT_CATEGORIES,
} = require('../../constants/catalogue');

const fieldError = (field, message) => ({ field, message });
const hasOwn = (value, field) => Object.prototype.hasOwnProperty.call(value, field);
const asTrimmedString = (value) => (typeof value === 'string' ? value.trim() : '');
const uniqueStrings = (value) =>
  Array.isArray(value) ? [...new Set(value.map(asTrimmedString).filter(Boolean))] : [];

const validDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const validHttpUrl = (value) => {
  if (!value) return true;
  try {
    const parsed = new URL(value);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

const unknownFieldErrors = (body, allowed) =>
  Object.keys(body)
    .filter((field) => !allowed.includes(field))
    .map((field) => fieldError(field, 'This field is not allowed.'));

const validateMovie = (body = {}, partial = false) => {
  const allowed = [
    'title',
    'synopsis',
    'runtimeMinutes',
    'releaseDate',
    'languages',
    'genres',
    'cast',
    'crew',
    'certification',
    'posterUrl',
    'backdropUrl',
    'trailerUrl',
    'status',
  ];
  const errors = unknownFieldErrors(body, allowed);
  const value = {};

  const required = (field) => !partial || hasOwn(body, field);
  if (required('title')) {
    const title = asTrimmedString(body.title);
    if (!title || title.length > 160) errors.push(fieldError('title', 'Title is required and must not exceed 160 characters.'));
    else value.title = title;
  }
  if (required('synopsis')) {
    const synopsis = asTrimmedString(body.synopsis);
    if (synopsis.length < 10 || synopsis.length > 3000) errors.push(fieldError('synopsis', 'Synopsis must contain between 10 and 3000 characters.'));
    else value.synopsis = synopsis;
  }
  if (required('runtimeMinutes')) {
    const runtimeMinutes = Number(body.runtimeMinutes);
    if (!Number.isInteger(runtimeMinutes) || runtimeMinutes < 1 || runtimeMinutes > 600) errors.push(fieldError('runtimeMinutes', 'Runtime must be an integer between 1 and 600 minutes.'));
    else value.runtimeMinutes = runtimeMinutes;
  }
  if (required('releaseDate')) {
    const releaseDate = validDate(body.releaseDate);
    if (!releaseDate) errors.push(fieldError('releaseDate', 'Enter a valid release date.'));
    else value.releaseDate = releaseDate;
  }
  for (const field of ['languages', 'genres']) {
    if (required(field)) {
      const items = uniqueStrings(body[field]);
      if (items.length === 0) errors.push(fieldError(field, `At least one ${field === 'genres' ? 'genre' : 'language'} is required.`));
      else value[field] = items;
    }
  }
  for (const field of ['cast', 'crew']) {
    if (hasOwn(body, field)) {
      if (!Array.isArray(body[field])) errors.push(fieldError(field, `${field} must be an array.`));
      else {
        value[field] = body[field]
          .map((person) => ({ name: asTrimmedString(person?.name), role: asTrimmedString(person?.role) }))
          .filter((person) => person.name);
      }
    }
  }
  for (const field of ['certification', 'posterUrl', 'backdropUrl', 'trailerUrl']) {
    if (hasOwn(body, field)) value[field] = asTrimmedString(body[field]) || undefined;
  }
  for (const field of ['posterUrl', 'backdropUrl', 'trailerUrl']) {
    if (hasOwn(value, field) && !validHttpUrl(value[field])) errors.push(fieldError(field, 'Enter a valid HTTP or HTTPS URL.'));
  }
  if (hasOwn(body, 'status')) {
    if (!MOVIE_STATUS_VALUES.includes(body.status)) errors.push(fieldError('status', 'Movie status is invalid.'));
    else value.status = body.status;
  }
  if (partial && Object.keys(value).length === 0 && errors.length === 0) errors.push(fieldError('body', 'Provide at least one movie field to update.'));
  return { errors, value };
};

const validateCinema = (body = {}, partial = false) => {
  const allowed = ['name', 'address', 'location', 'timezone', 'contact', 'amenities', 'isActive'];
  const errors = unknownFieldErrors(body, allowed);
  const value = {};
  const required = (field) => !partial || hasOwn(body, field);

  if (required('name')) {
    const name = asTrimmedString(body.name);
    if (name.length < 2 || name.length > 120) errors.push(fieldError('name', 'Cinema name must contain between 2 and 120 characters.'));
    else value.name = name;
  }
  if (required('address')) {
    const address = body.address || {};
    const normalized = {
      line1: asTrimmedString(address.line1),
      line2: asTrimmedString(address.line2) || undefined,
      city: asTrimmedString(address.city),
      state: asTrimmedString(address.state),
      postalCode: asTrimmedString(address.postalCode),
      country: asTrimmedString(address.country) || 'India',
    };
    if (!normalized.line1 || !normalized.city || !normalized.state || !normalized.postalCode) {
      errors.push(fieldError('address', 'Address line, city, state, and postal code are required.'));
    } else value.address = normalized;
  }
  if (hasOwn(body, 'location')) {
    const coordinates = body.location?.coordinates;
    const validCoordinates =
      Array.isArray(coordinates) &&
      coordinates.length === 2 &&
      coordinates.every(Number.isFinite) &&
      coordinates[0] >= -180 &&
      coordinates[0] <= 180 &&
      coordinates[1] >= -90 &&
      coordinates[1] <= 90;
    if (!validCoordinates) errors.push(fieldError('location.coordinates', 'Provide valid longitude and latitude.'));
    else value.location = { type: 'Point', coordinates };
  }
  if (hasOwn(body, 'timezone')) {
    const timezone = asTrimmedString(body.timezone);
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
      value.timezone = timezone;
    } catch {
      errors.push(fieldError('timezone', 'Provide a valid IANA timezone.'));
    }
  }
  if (hasOwn(body, 'contact')) {
    value.contact = {
      phone: asTrimmedString(body.contact?.phone) || undefined,
      email: asTrimmedString(body.contact?.email).toLowerCase() || undefined,
    };
  }
  if (hasOwn(body, 'amenities')) value.amenities = uniqueStrings(body.amenities);
  if (hasOwn(body, 'isActive')) value.isActive = Boolean(body.isActive);
  if (partial && Object.keys(value).length === 0 && errors.length === 0) errors.push(fieldError('body', 'Provide at least one cinema field to update.'));
  return { errors, value };
};

const validateScreen = (body = {}, partial = false) => {
  const allowed = ['name', 'seats', 'isActive'];
  const errors = unknownFieldErrors(body, allowed);
  const value = {};
  const required = (field) => !partial || hasOwn(body, field);

  if (required('name')) {
    const name = asTrimmedString(body.name);
    if (!name || name.length > 60) errors.push(fieldError('name', 'Screen name is required and must not exceed 60 characters.'));
    else value.name = name;
  }
  if (required('seats')) {
    if (!Array.isArray(body.seats) || body.seats.length < 1 || body.seats.length > 500) {
      errors.push(fieldError('seats', 'Provide between 1 and 500 seats.'));
    } else {
      value.seats = body.seats.map((seat, index) => {
        const normalized = {
          label: asTrimmedString(seat?.label).toUpperCase(),
          row: asTrimmedString(seat?.row).toUpperCase(),
          number: Number(seat?.number),
          category: seat?.category || 'standard',
          isAccessible: Boolean(seat?.isAccessible),
          isActive: seat?.isActive !== false,
        };
        if (!normalized.label || !normalized.row || !Number.isInteger(normalized.number) || normalized.number < 1) errors.push(fieldError(`seats.${index}`, 'Each seat requires a label, row, and positive integer number.'));
        if (!SEAT_CATEGORIES.includes(normalized.category)) errors.push(fieldError(`seats.${index}.category`, 'Seat category is invalid.'));
        return normalized;
      });
      const labels = value.seats.map((seat) => seat.label);
      const positions = value.seats.map((seat) => `${seat.row}:${seat.number}`);
      if (new Set(labels).size !== labels.length || new Set(positions).size !== positions.length) errors.push(fieldError('seats', 'Seat labels and row/number positions must be unique.'));
    }
  }
  if (hasOwn(body, 'isActive')) value.isActive = Boolean(body.isActive);
  if (partial && Object.keys(value).length === 0 && errors.length === 0) errors.push(fieldError('body', 'Provide at least one screen field to update.'));
  return { errors, value };
};

const validateShow = (body = {}, partial = false) => {
  const allowed = ['movieId', 'cinemaId', 'screenId', 'startAt', 'endAt', 'language', 'format', 'pricing', 'bookingOpensAt', 'bookingClosesAt', 'status'];
  const errors = unknownFieldErrors(body, allowed);
  const value = {};
  const required = (field) => !partial || hasOwn(body, field);

  for (const [input, output] of [['movieId', 'movie'], ['cinemaId', 'cinema'], ['screenId', 'screen']]) {
    if (required(input)) {
      if (!mongoose.isValidObjectId(body[input])) errors.push(fieldError(input, `${input} must be a valid identifier.`));
      else value[output] = body[input];
    }
  }
  for (const field of ['startAt', 'endAt', 'bookingOpensAt', 'bookingClosesAt']) {
    if (required(field) && ['startAt', 'endAt'].includes(field) || hasOwn(body, field)) {
      const date = validDate(body[field]);
      if (!date) errors.push(fieldError(field, `${field} must be a valid date.`));
      else value[field] = date;
    }
  }
  if (required('language')) {
    const language = asTrimmedString(body.language);
    if (!language || language.length > 40) errors.push(fieldError('language', 'Language is required and must not exceed 40 characters.'));
    else value.language = language;
  }
  if (required('format')) {
    const format = body.format || '2D';
    if (!SHOW_FORMATS.includes(format)) errors.push(fieldError('format', 'Show format is invalid.'));
    else value.format = format;
  }
  if (required('pricing')) {
    if (!Array.isArray(body.pricing) || body.pricing.length === 0) errors.push(fieldError('pricing', 'At least one price is required.'));
    else {
      value.pricing = body.pricing.map((price, index) => {
        const amount = Number(price?.amount);
        const item = {
          category: price?.category,
          amount,
          currency: asTrimmedString(price?.currency).toUpperCase(),
        };
        if (!SEAT_CATEGORIES.includes(item.category)) errors.push(fieldError(`pricing.${index}.category`, 'Price category is invalid.'));
        if (!Number.isInteger(amount) || amount < 0) errors.push(fieldError(`pricing.${index}.amount`, 'Price amount must be a non-negative integer in minor units.'));
        if (!/^[A-Z]{3}$/.test(item.currency)) errors.push(fieldError(`pricing.${index}.currency`, 'Currency must be a three-letter code.'));
        return item;
      });
      const categories = value.pricing.map((price) => price.category);
      if (new Set(categories).size !== categories.length) errors.push(fieldError('pricing', 'Each seat category can have only one price.'));
    }
  }
  if (hasOwn(body, 'status')) {
    if (!SHOW_STATUS_VALUES.includes(body.status)) errors.push(fieldError('status', 'Show status is invalid.'));
    else value.status = body.status;
  }
  if (value.startAt && value.endAt && value.endAt <= value.startAt) errors.push(fieldError('endAt', 'Show end time must be later than start time.'));
  if (partial && Object.keys(value).length === 0 && errors.length === 0) errors.push(fieldError('body', 'Provide at least one show field to update.'));
  return { errors, value };
};

module.exports = {
  validateMovieCreate: (body) => validateMovie(body, false),
  validateMovieUpdate: (body) => validateMovie(body, true),
  validateCinemaCreate: (body) => validateCinema(body, false),
  validateCinemaUpdate: (body) => validateCinema(body, true),
  validateScreenCreate: (body) => validateScreen(body, false),
  validateScreenUpdate: (body) => validateScreen(body, true),
  validateShowCreate: (body) => validateShow(body, false),
  validateShowUpdate: (body) => validateShow(body, true),
};

