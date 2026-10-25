const {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
} = require('../../../src/validators/auth/authValidators');

describe('authentication validators', () => {
  test('normalizes valid registration data', () => {
    const result = validateRegister({
      name: '  Test Customer  ',
      email: ' CUSTOMER@EXAMPLE.COM ',
      phone: ' +919876543210 ',
      password: 'Password1',
    });

    expect(result.errors).toEqual([]);
    expect(result.value).toEqual({
      name: 'Test Customer',
      email: 'customer@example.com',
      password: 'Password1',
      phone: '+919876543210',
    });
  });

  test('rejects weak registration data', () => {
    const result = validateRegister({ name: 'A', email: 'bad', password: 'weak' });
    expect(result.errors.map((error) => error.field)).toEqual(['name', 'email', 'password']);
  });

  test('rejects an invalid optional phone number', () => {
    const result = validateRegister({ name: 'Valid Name', email: 'valid@example.com', phone: '9876543210', password: 'Password1' });
    expect(result.errors).toContainEqual({
      field: 'phone',
      message: 'Phone must use international E.164 format, for example +919876543210.',
    });
  });

  test('requires login credentials', () => {
    const result = validateLogin({});
    expect(result.errors).toHaveLength(2);
  });

  test('allows only profile fields and blocks role changes', () => {
    const result = validateProfileUpdate({ name: 'New Name', role: 'admin' });
    expect(result.errors).toContainEqual({ field: 'role', message: 'This field cannot be updated.' });
  });
});

