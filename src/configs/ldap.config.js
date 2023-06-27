const helper = require('../utils/helper.util');

const ldap = {
  client: {
    url: helper.validateEnv('SEARCH_API_LDAP_URL'),
    timeout: 5000,
    connectTimeout: 3000
  },
  filter: {
    base: 'c=ch',
    roots: process.env.SEARCH_API_LDAP_ROOTS_FILTER
  }
};

module.exports = ldap;
