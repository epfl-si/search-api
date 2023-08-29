const ldap = require('ldapjs');
const ldapConfig = require('../configs/ldap.config');

function getSciper (entry) {
  const uids = entry.attributes.filter(
    f => f.type === 'uniqueIdentifier'
  ).map(m => m.values).pop();
  return uids[0];
}

function searchAll (base, options) {
  return new Promise((resolve, reject) => {
    // http://ldapjs.org/client.html
    const client = ldap.createClient(ldapConfig.client);
    client.on('error', (err) => {
      console.error('[error] ' + err.message);
      reject(err);
    });

    client.search(base, options, (x, res) => {
      const personsBySciper = {};

      res.on('searchEntry', (entry) => {
        const userSciper = getSciper(entry);
        if (!(userSciper in personsBySciper)) {
          personsBySciper[userSciper] = [];
        }
        personsBySciper[userSciper].push(entry.pojo);
      });

      res.on('timeout', (err) => {
        client.destroy();
        reject(err);
      });

      res.on('error', (err) => {
        client.destroy();
        reject(err);
      });

      res.on('end', () => {
        client.destroy();
        resolve(personsBySciper);
      });
    });
  });
}

module.exports = {
  searchAll
};
