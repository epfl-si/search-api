const helper = require('../utils/helper.util');

const cadidb = {
  db: {
    connectionLimit: 10,
    host: helper.validateEnv('SEARCH_API_CADIDB_HOST'),
    user: helper.validateEnv('SEARCH_API_CADIDB_USER'),
    password: helper.validateEnv('SEARCH_API_CADIDB_PASSWORD'),
    database: helper.validateEnv('SEARCH_API_CADIDB_DATABASE'),
    port: helper.validateEnv('SEARCH_API_CADIDB_PORT')
  }
};

module.exports = cadidb;
