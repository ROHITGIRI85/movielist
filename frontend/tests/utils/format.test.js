import { dateTime, money } from '../../src/utils/format';

test('formats integer minor currency units', () => {
  expect(money(25000, 'INR')).toContain('250');
});

test('formats an ISO date for people', () => {
  expect(dateTime('2030-01-01T12:00:00.000Z')).toMatch(/2030/);
});
