const helper = require('../utils/helper.util');

const api = {
  enableCse: helper.setBool('SEARCH_API_ENABLE_CSE'),
  enableLdap: helper.setBool('SEARCH_API_ENABLE_LDAP'),
  enableUnit: helper.setBool('SEARCH_API_ENABLE_UNIT'),
  enableGraphsearch: helper.setBool('SEARCH_API_ENABLE_GRAPHSEARCH')
};

module.exports = api;
