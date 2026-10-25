const ShowSeat = require('../../models/ShowSeat');
const Screen = require('../../models/Screen');
const ApiError = require('../../utils/ApiError');
const { SEAT_STATUS } = require('../../constants/booking');

const buildInventory = async (show) => {
  const screen = await Screen.findById(show.screen);
  if (!screen) throw new ApiError(422, 'SCREEN_NOT_SCHEDULABLE', 'The show screen does not exist.');
  const priceByCategory = new Map(show.pricing.map((price) => [price.category, price]));
  return screen.seats.filter((seat) => seat.isActive).map((seat) => {
    const price = priceByCategory.get(seat.category);
    if (!price) {
      throw new ApiError(422, 'MISSING_SEAT_PRICE', `A price is required for the ${seat.category} seat category.`);
    }
    return {
      show: show._id,
      seatId: seat._id,
      label: seat.label,
      row: seat.row,
      number: seat.number,
      category: seat.category,
      amount: price.amount,
      currency: price.currency,
      status: SEAT_STATUS.AVAILABLE,
    };
  });
};

const createShowInventory = async (show) => {
  const inventory = await buildInventory(show);
  if (inventory.length) await ShowSeat.insertMany(inventory, { ordered: true });
  return inventory.length;
};

const releaseExpiredHolds = async ({ showId, now = new Date() } = {}) => {
  const filter = { status: SEAT_STATUS.HELD, holdExpiresAt: { $lte: now } };
  if (showId) filter.show = showId;
  return ShowSeat.updateMany(filter, {
    $set: { status: SEAT_STATUS.AVAILABLE, holdToken: null, holdOwner: null, holdExpiresAt: null, booking: null },
  });
};

const listShowSeats = async (showId) => {
  await releaseExpiredHolds({ showId });
  return ShowSeat.find({ show: showId })
    .select('-holdToken -holdOwner -booking')
    .sort({ row: 1, number: 1 });
};

module.exports = { buildInventory, createShowInventory, releaseExpiredHolds, listShowSeats };
