const mongoose = require('mongoose');
const Cinema = require('../../models/Cinema');
const Screen = require('../../models/Screen');
const Show = require('../../models/Show');
const ApiError = require('../../utils/ApiError');
const slugify = require('../../utils/slugify');
const { getPagination, paginationMeta } = require('../../utils/pagination');
const { SHOW_STATUS } = require('../../constants/catalogue');

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const createUniqueSlug = async (name) => {
  const base = slugify(name) || 'cinema';
  let slug = base;
  let suffix = 2;
  while (await Cinema.exists({ slug })) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
  return slug;
};

const findCinema = async (identifier, { activeOnly = false } = {}) => {
  const identity = mongoose.isValidObjectId(identifier) ? { _id: identifier } : { slug: identifier.toLowerCase() };
  const cinema = await Cinema.findOne({ ...identity, ...(activeOnly ? { isActive: true } : {}) });
  if (!cinema) throw new ApiError(404, 'CINEMA_NOT_FOUND', 'Cinema was not found.');
  return cinema;
};

const createCinema = async (data) => Cinema.create({ ...data, slug: await createUniqueSlug(data.name) });

const updateCinema = async (cinemaId, data) => {
  const cinema = await findCinema(cinemaId);
  Object.assign(cinema, data);
  await cinema.save();
  return cinema;
};

const deactivateCinema = async (cinemaId) => {
  const cinema = await findCinema(cinemaId);
  cinema.isActive = false;
  await cinema.save();
  await Screen.updateMany({ cinema: cinema._id }, { isActive: false });
  await Show.updateMany({ cinema: cinema._id, status: SHOW_STATUS.SCHEDULED }, { status: SHOW_STATUS.CANCELLED });
  return cinema;
};

const listCinemas = async (query = {}, { admin = false } = {}) => {
  const { page, limit, skip } = getPagination(query);
  const filter = admin ? {} : { isActive: true };
  if (query.city?.trim()) filter['address.city'] = new RegExp(`^${escapeRegExp(query.city.trim())}$`, 'i');
  if (admin && ['true', 'false'].includes(query.isActive)) filter.isActive = query.isActive === 'true';
  const [items, total] = await Promise.all([
    Cinema.find(filter).sort({ 'address.city': 1, name: 1 }).skip(skip).limit(limit),
    Cinema.countDocuments(filter),
  ]);
  return { items, meta: paginationMeta({ page, limit, total }) };
};

const createScreen = async (cinemaId, data) => {
  const cinema = await findCinema(cinemaId);
  return Screen.create({ ...data, cinema: cinema._id });
};

const findScreen = async (screenId) => {
  if (!mongoose.isValidObjectId(screenId)) throw new ApiError(400, 'INVALID_IDENTIFIER', 'Screen identifier is invalid.');
  const screen = await Screen.findById(screenId);
  if (!screen) throw new ApiError(404, 'SCREEN_NOT_FOUND', 'Screen was not found.');
  return screen;
};

const updateScreen = async (screenId, data) => {
  const screen = await findScreen(screenId);
  Object.assign(screen, data);
  await screen.save();
  return screen;
};

const deactivateScreen = async (screenId) => {
  const screen = await findScreen(screenId);
  screen.isActive = false;
  await screen.save();
  await Show.updateMany({ screen: screen._id, status: SHOW_STATUS.SCHEDULED }, { status: SHOW_STATUS.CANCELLED });
  return screen;
};

const listScreens = async (cinemaId, { admin = false } = {}) => {
  const cinema = await findCinema(cinemaId, { activeOnly: !admin });
  return Screen.find({ cinema: cinema._id, ...(admin ? {} : { isActive: true }) }).sort({ name: 1 });
};

module.exports = {
  createCinema,
  updateCinema,
  deactivateCinema,
  findCinema,
  listCinemas,
  createScreen,
  updateScreen,
  deactivateScreen,
  findScreen,
  listScreens,
};

