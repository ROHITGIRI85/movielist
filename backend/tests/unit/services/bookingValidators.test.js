const { validateHoldCreate, validateConfirmation } = require('../../../src/validators/bookings/bookingValidators');

describe('booking validators', () => {
  test('rejects duplicate seats and client totals', () => {
    const id = '700000000000000000000001';
    const result = validateHoldCreate({ showId: id, seatIds: [id, id], total: 1 });
    expect(result.errors).toEqual(expect.arrayContaining([expect.objectContaining({ field: 'seatIds' })]));
    expect(result.value.total).toBeUndefined();
  });

  test('requires an explicit simulated payment result', () => {
    expect(validateConfirmation({ paymentResult: 'paid' }).errors).toHaveLength(1);
    expect(validateConfirmation({ paymentResult: 'success' }).errors).toHaveLength(0);
  });
});
