const helper = require('../utils/helper.util');

const apimd = {
  baseURL: helper.validateEnv('SEARCH_API_MD_BASE_URL'),
  username: helper.validateEnv('SEARCH_API_MD_USER'),
  password: helper.validateEnv('SEARCH_API_MD_PASSWORD')
};

module.exports = apimd;
