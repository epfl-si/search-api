const helper = require('../utils/helper.util');

const cse = {
  apiKey: helper.validateEnv('SEARCH_API_CSE_API_KEY'),
  cx: helper.validateEnv('SEARCH_API_CSE_CX')
};

module.exports = cse;
