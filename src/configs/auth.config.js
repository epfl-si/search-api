const helper = require('../utils/helper.util');

const auth = {
  secret: helper.validateEnv('SEARCH_API_SESSION_SECRET'),
  searchUrl: helper.validateEnv('SEARCH_API_SEARCH_URL'),
  internal: helper.validateEnv('SEARCH_API_X_EPFL_INTERNAL')
};

module.exports = auth;
