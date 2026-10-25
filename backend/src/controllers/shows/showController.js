const asyncHandler = require('../../utils/asyncHandler');
const showService = require('../../services/catalogue/showService');

const listPublicShows = asyncHandler(async (req, res) => {
  const result = await showService.listShows(req.query);
  res.status(200).json({ success: true, data: { shows: result.items }, meta: result.meta });
});

const getPublicShow = asyncHandler(async (req, res) => {
  const show = await showService.findShow(req.params.showId, { publicOnly: true });
  res.status(200).json({ success: true, data: { show } });
});

const listAdminShows = asyncHandler(async (req, res) => {
  const result = await showService.listShows(req.query, { admin: true });
  res.status(200).json({ success: true, data: { shows: result.items }, meta: result.meta });
});

const createShow = asyncHandler(async (req, res) => {
  const show = await showService.createShow(req.validatedBody);
  res.status(201).json({ success: true, data: { show } });
});

const updateShow = asyncHandler(async (req, res) => {
  const show = await showService.updateShow(req.params.showId, req.validatedBody);
  res.status(200).json({ success: true, data: { show } });
});

const cancelShow = asyncHandler(async (req, res) => {
  const show = await showService.cancelShow(req.params.showId);
  res.status(200).json({ success: true, data: { show } });
});

module.exports = { listPublicShows, getPublicShow, listAdminShows, createShow, updateShow, cancelShow };

