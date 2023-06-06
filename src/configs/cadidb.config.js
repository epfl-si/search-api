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

if (!cadidb.db.host) {
  console.error(
    '[error] The "SEARCH_API_CADIDB_HOST" environment variable is required'
  );
  process.exit(1);
}

if (!cadidb.db.user) {
  console.error(
    '[error] The "SEARCH_API_CADIDB_USER" environment variable is required'
  );
  process.exit(1);
}

if (!cadidb.db.password) {
  console.error(
    '[error] The "SEARCH_API_CADIDB_PASSWORD" environment variable is required'
  );
  process.exit(1);
}

if (!cadidb.db.database) {
  console.error(
    '[error] The "SEARCH_API_CADIDB_DATABASE" environment variable is required'
  );
  process.exit(1);
}

if (!cadidb.db.port) {
  console.error(
    '[error] The "SEARCH_API_CADIDB_PORT" environment variable is required'
  );
  process.exit(1);
}

module.exports = cadidb;
