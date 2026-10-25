const mongoose = require('mongoose');
const Show = require('../../models/Show');
const Movie = require('../../models/Movie');
const Cinema = require('../../models/Cinema');
const Screen = require('../../models/Screen');
const ApiError = require('../../utils/ApiError');
const { getPagination, paginationMeta } = require('../../utils/pagination');
const { MOVIE_STATUS, SHOW_STATUS } = require('../../constants/catalogue');
const ShowSeat = require('../../models/ShowSeat');
const { createShowInventory, buildInventory } = require('../inventory/inventoryService');
const { SEAT_STATUS } = require('../../constants/booking');

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const assertObjectId = (id, label) => {
  if (!mongoose.isValidObjectId(id)) throw new ApiError(400, 'INVALID_IDENTIFIER', `${label} identifier is invalid.`);
};

const findShow = async (showId, { publicOnly = false } = {}) => {
  assertObjectId(showId, 'Show');
  const show = await Show.findOne({ _id: showId, ...(publicOnly ? { status: SHOW_STATUS.SCHEDULED } : {}) })
    .populate('movie')
    .populate('cinema')
    .populate('screen');
  if (!show || (publicOnly && (show.movie?.status !== MOVIE_STATUS.PUBLISHED || !show.cinema?.isActive || !show.screen?.isActive))) {
    throw new ApiError(404, 'SHOW_NOT_FOUND', 'Show was not found.');
  }
  return show;
};

const validateReferences = async ({ movie, cinema, screen }) => {
  const [movieRecord, cinemaRecord, screenRecord] = await Promise.all([
    Movie.findById(movie),
    Cinema.findById(cinema),
    Screen.findById(screen),
  ]);
  if (!movieRecord || movieRecord.status !== MOVIE_STATUS.PUBLISHED) throw new ApiError(422, 'MOVIE_NOT_SCHEDULABLE', 'A published movie is required.');
  if (!cinemaRecord?.isActive) throw new ApiError(422, 'CINEMA_NOT_SCHEDULABLE', 'An active cinema is required.');
  if (!screenRecord?.isActive) throw new ApiError(422, 'SCREEN_NOT_SCHEDULABLE', 'An active screen is required.');
  if (screenRecord.cinema.toString() !== cinemaRecord.id) throw new ApiError(422, 'SCREEN_CINEMA_MISMATCH', 'The selected screen does not belong to the selected cinema.');
};

const ensureNoOverlap = async ({ screen, startAt, endAt, excludedShowId }) => {
  const overlap = await Show.exists({
    screen,
    status: SHOW_STATUS.SCHEDULED,
    ...(excludedShowId ? { _id: { $ne: excludedShowId } } : {}),
    startAt: { $lt: endAt },
    endAt: { $gt: startAt },
  });
  if (overlap) throw new ApiError(409, 'SHOW_TIME_CONFLICT', 'This screen already has an overlapping show.');
};

const createShow = async (data) => {
  await validateReferences(data);
  await ensureNoOverlap(data);
  const show = await Show.create(data);
  try {
    await createShowInventory(show);
    return show;
  } catch (error) {
    await Show.deleteOne({ _id: show._id });
    throw error;
  }
};

const updateShow = async (showId, data) => {
  assertObjectId(showId, 'Show');
  const show = await Show.findById(showId);
  if (!show) throw new ApiError(404, 'SHOW_NOT_FOUND', 'Show was not found.');
  const merged = {
    movie: data.movie || show.movie,
    cinema: data.cinema || show.cinema,
    screen: data.screen || show.screen,
    startAt: data.startAt || show.startAt,
    endAt: data.endAt || show.endAt,
  };
  await validateReferences(merged);
  const inventoryChange = data.screen || data.pricing;
  if (inventoryChange) {
    const allocated = await ShowSeat.exists({ show: show._id, status: { $ne: SEAT_STATUS.AVAILABLE } });
    if (allocated) throw new ApiError(409, 'SHOW_INVENTORY_LOCKED', 'Screen or pricing cannot change after seats have been held or booked.');
  }
  if ((data.status || show.status) === SHOW_STATUS.SCHEDULED) {
    await ensureNoOverlap({ ...merged, excludedShowId: show._id });
  }
  Object.assign(show, data);
  await show.save();
  if (inventoryChange) {
    const inventory = await buildInventory(show);
    await ShowSeat.deleteMany({ show: show._id });
    if (inventory.length) await ShowSeat.insertMany(inventory);
  }
  return show;
};

const cancelShow = async (showId) => {
  assertObjectId(showId, 'Show');
  const show = await Show.findById(showId);
  if (!show) throw new ApiError(404, 'SHOW_NOT_FOUND', 'Show was not found.');
  show.status = SHOW_STATUS.CANCELLED;
  await show.save();
  await ShowSeat.updateMany(
    { show: show._id, status: { $ne: SEAT_STATUS.BOOKED } },
    { $set: { status: SEAT_STATUS.AVAILABLE, holdToken: null, holdOwner: null, holdExpiresAt: null, booking: null } },
  );
  return show;
};

const listShows = async (query = {}, { admin = false } = {}) => {
  const { page, limit, skip } = getPagination(query);
  const filter = admin ? {} : { status: SHOW_STATUS.SCHEDULED };
  if (admin && query.status) filter.status = query.status;
  for (const [queryField, modelField] of [['movieId', 'movie'], ['cinemaId', 'cinema'], ['screenId', 'screen']]) {
    if (query[queryField]) {
      assertObjectId(query[queryField], queryField.replace('Id', ''));
      filter[modelField] = query[queryField];
    }
  }
  if (query.language?.trim()) filter.language = new RegExp(`^${escapeRegExp(query.language.trim())}$`, 'i');
  if (query.date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(query.date)) throw new ApiError(422, 'INVALID_DATE', 'Date must use YYYY-MM-DD format.');
    const start = new Date(`${query.date}T00:00:00.000Z`);
    if (Number.isNaN(start.getTime())) throw new ApiError(422, 'INVALID_DATE', 'Date must be valid.');
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);
    filter.startAt = { $gte: start, $lt: end };
  }
  const [rawItems, total] = await Promise.all([
    Show.find(filter).populate('movie').populate('cinema').populate('screen').sort({ startAt: 1 }).skip(skip).limit(limit),
    Show.countDocuments(filter),
  ]);
  const items = admin
    ? rawItems
    : rawItems.filter((show) => show.movie?.status === MOVIE_STATUS.PUBLISHED && show.cinema?.isActive && show.screen?.isActive);
  return { items, meta: paginationMeta({ page, limit, total }) };
};

module.exports = { createShow, updateShow, cancelShow, findShow, listShows };

