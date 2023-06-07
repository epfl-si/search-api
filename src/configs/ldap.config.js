const helper = require('../utils/helper.util');

const ldap = {
  url: helper.validateEnv('SEARCH_API_LDAP_URL'),
  timeout: 5000,
  connectTimeout: 3000
};

module.exports = ldap;
