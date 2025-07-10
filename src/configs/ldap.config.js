const helper = require('../utils/helper.util');

const ldap = {
  client: {
    url: helper.validateEnv('SEARCH_API_LDAP_URL'),
    timeout: 10000,
    connectTimeout: 5000
  },
  filter: {
    base: 'c=ch',
    roots: process.env.SEARCH_API_LDAP_ROOTS_FILTER
  }
};

module.exports = ldap;
