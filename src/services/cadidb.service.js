const mysql = require('mysql2');
const cadidbConfig = require('../configs/cadidb.config');

// Create the pool
const pool = mysql.createPool(cadidbConfig.db);

async function sendQuery (query, values) {
  try {
    // Get a Promise wrapped instance of the pool
    const promisePool = pool.promise();
    // Perform the database query
    const [rows] = await promisePool.query(query, values);
    return (rows);
  } catch (err) {
    console.error('Error executing query', err);
    return (err);
  }
}

module.exports = {
  sendQuery
};
