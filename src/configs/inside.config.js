const helper = require('../utils/helper.util');

const inside = {
  baseUrl: helper.validateEnv('SEARCH_API_ELASTIC_SEARCH_URL'),
  username: helper.validateEnv('SEARCH_API_ELASTIC_RO_USERNAME'),
  password: helper.validateEnv('SEARCH_API_ELASTIC_RO_PASSWORD')
};

module.exports = inside;
