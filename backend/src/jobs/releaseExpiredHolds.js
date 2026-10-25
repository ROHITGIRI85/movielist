const { releaseExpiredHolds } = require('../services/inventory/inventoryService');
const { expireBookings } = require('../services/bookings/bookingService');

const releaseExpiredBookingHolds = async () => {
  const expiredBookings = await expireBookings();
  await releaseExpiredHolds();
  return expiredBookings;
};

module.exports = releaseExpiredBookingHolds;
