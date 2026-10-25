const asyncHandler = require('../../utils/asyncHandler');
const showService = require('../../services/catalogue/showService');
const inventoryService = require('../../services/inventory/inventoryService');

const listShowSeats = asyncHandler(async (req, res) => {
  const show = await showService.findShow(req.params.showId, { publicOnly: true });
  const seats = await inventoryService.listShowSeats(show._id);
  res.status(200).json({ success: true, data: { showId: show.id, seats } });
});

module.exports = { listShowSeats };
