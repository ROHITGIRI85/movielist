const { ROLES } = require('../../src/constants/roles');

const demoAccountsFromEnv = () => [
  {
    name: 'IMovies Admin',
    email: process.env.SEED_ADMIN_EMAIL,
    password: process.env.SEED_ADMIN_PASSWORD,
    role: ROLES.ADMIN,
  },
  {
    name: 'IMovies Customer',
    email: process.env.SEED_CUSTOMER_EMAIL,
    password: process.env.SEED_CUSTOMER_PASSWORD,
    role: ROLES.CUSTOMER,
  },
].filter((account) => account.email && account.password);

module.exports = demoAccountsFromEnv;
