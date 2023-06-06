const ldap = require('ldapjs');

const client = ldap.createClient({
  url: 'ldaps://ldap.epfl.ch'
});

function searchAll (base, options) {
  return new Promise((resolve, reject) => {
    client.search(base, options, (err, res) => {
      if (err) {
        console.error('[error] ' + err.message);
        reject(err);
      }
      const listObj = [];

      res.on('searchEntry', (entry) => {
        listObj.push(entry.pojo);
      });

      res.on('timeout', (err) => {
        console.error('[error] ' + err.message);
        reject(err);
      });

      res.on('error', (err) => {
        console.error('[error] ' + err.message);
        reject(err);
      });

      res.on('end', () => {
        resolve(listObj);
      });
    });
  });
}

module.exports = {
  searchAll
};
