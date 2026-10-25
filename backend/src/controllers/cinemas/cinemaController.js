const asyncHandler = require('../../utils/asyncHandler');
const cinemaService = require('../../services/catalogue/cinemaService');

const listPublicCinemas = asyncHandler(async (req, res) => {
  const result = await cinemaService.listCinemas(req.query);
  res.status(200).json({ success: true, data: { cinemas: result.items }, meta: result.meta });
});

const getPublicCinema = asyncHandler(async (req, res) => {
  const cinema = await cinemaService.findCinema(req.params.cinemaId, { activeOnly: true });
  res.status(200).json({ success: true, data: { cinema } });
});

const listPublicScreens = asyncHandler(async (req, res) => {
  const screens = await cinemaService.listScreens(req.params.cinemaId);
  res.status(200).json({ success: true, data: { screens } });
});

const listAdminCinemas = asyncHandler(async (req, res) => {
  const result = await cinemaService.listCinemas(req.query, { admin: true });
  res.status(200).json({ success: true, data: { cinemas: result.items }, meta: result.meta });
});

const createCinema = asyncHandler(async (req, res) => {
  const cinema = await cinemaService.createCinema(req.validatedBody);
  res.status(201).json({ success: true, data: { cinema } });
});

const updateCinema = asyncHandler(async (req, res) => {
  const cinema = await cinemaService.updateCinema(req.params.cinemaId, req.validatedBody);
  res.status(200).json({ success: true, data: { cinema } });
});

const deactivateCinema = asyncHandler(async (req, res) => {
  const cinema = await cinemaService.deactivateCinema(req.params.cinemaId);
  res.status(200).json({ success: true, data: { cinema } });
});

const listAdminScreens = asyncHandler(async (req, res) => {
  const screens = await cinemaService.listScreens(req.params.cinemaId, { admin: true });
  res.status(200).json({ success: true, data: { screens } });
});

const createScreen = asyncHandler(async (req, res) => {
  const screen = await cinemaService.createScreen(req.params.cinemaId, req.validatedBody);
  res.status(201).json({ success: true, data: { screen } });
});

const updateScreen = asyncHandler(async (req, res) => {
  const screen = await cinemaService.updateScreen(req.params.screenId, req.validatedBody);
  res.status(200).json({ success: true, data: { screen } });
});

const deactivateScreen = asyncHandler(async (req, res) => {
  const screen = await cinemaService.deactivateScreen(req.params.screenId);
  res.status(200).json({ success: true, data: { screen } });
});

module.exports = {
  listPublicCinemas,
  getPublicCinema,
  listPublicScreens,
  listAdminCinemas,
  createCinema,
  updateCinema,
  deactivateCinema,
  listAdminScreens,
  createScreen,
  updateScreen,
  deactivateScreen,
};

