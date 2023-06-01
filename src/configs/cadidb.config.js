const cadidb = {
  db: {
    connectionLimit: 10,
    host: process.env.SEARCH_API_CADIDB_HOST,
    user: process.env.SEARCH_API_CADIDB_USER,
    password: process.env.SEARCH_API_CADIDB_PASSWORD,
    database: process.env.SEARCH_API_CADIDB_DATABASE,
    port: process.env.SEARCH_API_CADIDB_PORT
  }
};

module.exports = cadidb;
