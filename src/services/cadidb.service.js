const mysql = require('mysql2/promise');
const cadidbConfig = require('../configs/cadidb.config');

const pool = mysql.createPool(cadidbConfig.db);

async function sendQuery (query, values, referrer) {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.query(query, values, referrer);
    return rows;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

module.exports = {
  sendQuery
};
