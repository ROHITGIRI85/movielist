const mongoose = require('mongoose');
const Movie = require('../../models/Movie');
const ApiError = require('../../utils/ApiError');
const slugify = require('../../utils/slugify');
const { getPagination, paginationMeta } = require('../../utils/pagination');
const { MOVIE_STATUS } = require('../../constants/catalogue');

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const createUniqueSlug = async (title) => {
  const base = slugify(title) || 'movie';
  let slug = base;
  let suffix = 2;
  while (await Movie.exists({ slug })) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
  return slug;
};

const findByIdOrSlug = async (identifier, { publicOnly = false } = {}) => {
  const identity = mongoose.isValidObjectId(identifier) ? { _id: identifier } : { slug: identifier.toLowerCase() };
  const movie = await Movie.findOne({ ...identity, ...(publicOnly ? { status: MOVIE_STATUS.PUBLISHED } : {}) });
  if (!movie) throw new ApiError(404, 'MOVIE_NOT_FOUND', 'Movie was not found.');
  return movie;
};

const createMovie = async (data) => Movie.create({ ...data, slug: await createUniqueSlug(data.title) });

const updateMovie = async (movieId, data) => {
  const movie = await findByIdOrSlug(movieId);
  Object.assign(movie, data);
  await movie.save();
  return movie;
};

const archiveMovie = async (movieId) => {
  const movie = await findByIdOrSlug(movieId);
  movie.status = MOVIE_STATUS.ARCHIVED;
  await movie.save();
  return movie;
};

const listMovies = async (query = {}, { admin = false } = {}) => {
  const { page, limit, skip } = getPagination(query);
  const filter = admin ? {} : { status: MOVIE_STATUS.PUBLISHED };
  if (admin && query.status) filter.status = query.status;
  if (query.genre?.trim()) filter.genres = new RegExp(`^${escapeRegExp(query.genre.trim())}$`, 'i');
  if (query.language?.trim()) filter.languages = new RegExp(`^${escapeRegExp(query.language.trim())}$`, 'i');
  if (query.minRating) {
    const rating = Number(query.minRating);
    if (Number.isFinite(rating) && rating >= 0 && rating <= 5) filter.averageRating = { $gte: rating };
  }
  if (query.q?.trim()) filter.$text = { $search: query.q.trim() };
  const sort = query.sort === 'rating' ? { averageRating: -1, releaseDate: -1 } : { releaseDate: -1, title: 1 };
  const [items, total] = await Promise.all([
    Movie.find(filter).sort(sort).skip(skip).limit(limit),
    Movie.countDocuments(filter),
  ]);
  return { items, meta: paginationMeta({ page, limit, total }) };
};

module.exports = { createMovie, updateMovie, archiveMovie, findByIdOrSlug, listMovies };

