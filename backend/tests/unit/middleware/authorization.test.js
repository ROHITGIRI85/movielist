const requireRole = require('../../../src/middleware/auth/requireRole');
const requireOwnershipOrRole = require('../../../src/middleware/auth/requireOwnershipOrRole');
const { ROLES } = require('../../../src/constants/roles');

const response = {};

describe('authorization middleware', () => {
  test('allows a required role', () => {
    const next = jest.fn();
    requireRole(ROLES.ADMIN)({ user: { role: ROLES.ADMIN } }, response, next);
    expect(next).toHaveBeenCalledWith();
  });

  test('rejects a missing role', () => {
    const next = jest.fn();
    requireRole(ROLES.ADMIN)({ user: { role: ROLES.CUSTOMER } }, response, next);
    expect(next.mock.calls[0][0]).toMatchObject({ statusCode: 403, code: 'FORBIDDEN' });
  });

  test('allows an owner or an explicitly permitted role', () => {
    const middleware = requireOwnershipOrRole({
      getOwnerId: (req) => req.resource.ownerId,
      allowedRoles: [ROLES.ADMIN],
    });
    const ownerNext = jest.fn();
    const adminNext = jest.fn();

    middleware({ user: { id: 'user-1', role: ROLES.CUSTOMER }, resource: { ownerId: 'user-1' } }, response, ownerNext);
    middleware({ user: { id: 'admin-1', role: ROLES.ADMIN }, resource: { ownerId: 'user-1' } }, response, adminNext);

    expect(ownerNext).toHaveBeenCalledWith();
    expect(adminNext).toHaveBeenCalledWith();
  });
});

