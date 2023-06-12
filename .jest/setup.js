const ldapServer = require('../tests/mock/ldap.server');

module.exports = () => {
  ldapServer.start();
  global.__LDAPSERVER__ = ldapServer;
};
