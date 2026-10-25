const asyncHandler = require('../../utils/asyncHandler');
const movieService = require('../../services/catalogue/movieService');

const listPublicMovies = asyncHandler(async (req, res) => {
  const result = await movieService.listMovies(req.query);
  res.status(200).json({ success: true, data: { movies: result.items }, meta: result.meta });
});

const getPublicMovie = asyncHandler(async (req, res) => {
  const movie = await movieService.findByIdOrSlug(req.params.movieId, { publicOnly: true });
  res.status(200).json({ success: true, data: { movie } });
});

const listAdminMovies = asyncHandler(async (req, res) => {
  const result = await movieService.listMovies(req.query, { admin: true });
  res.status(200).json({ success: true, data: { movies: result.items }, meta: result.meta });
});

const createMovie = asyncHandler(async (req, res) => {
  const movie = await movieService.createMovie(req.validatedBody);
  res.status(201).json({ success: true, data: { movie } });
});

const getAdminMovie = asyncHandler(async (req, res) => {
  const movie = await movieService.findByIdOrSlug(req.params.movieId);
  res.status(200).json({ success: true, data: { movie } });
});

const updateMovie = asyncHandler(async (req, res) => {
  const movie = await movieService.updateMovie(req.params.movieId, req.validatedBody);
  res.status(200).json({ success: true, data: { movie } });
});

const archiveMovie = asyncHandler(async (req, res) => {
  const movie = await movieService.archiveMovie(req.params.movieId);
  res.status(200).json({ success: true, data: { movie } });
});

module.exports = {
  listPublicMovies,
  getPublicMovie,
  listAdminMovies,
  createMovie,
  getAdminMovie,
  updateMovie,
  archiveMovie,
};

