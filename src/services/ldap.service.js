const ldap = require('ldapjs');

const client = ldap.createClient({
  url: 'ldaps://ldap.epfl.ch'
});

module.exports = client;
