const mysql = require('mysql2');
const cadidbConfig = require('../configs/cadidb.config');

const pool = mysql.createPool(cadidbConfig.db);

async function sendQuery (query, values) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        console.error('Error acquiring MySQL connection: ', err);
        return reject(err);
      }
      connection.query(query, values, (err, results) => {
        connection.release();

        if (err) {
          console.error('Error executing MySQL query: ', err);
          return reject(err);
        }

        resolve(results);
      });
    });
  });
}

module.exports = {
  sendQuery
};
