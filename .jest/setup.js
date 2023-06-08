const ldapServer = require('../tests/mock/ldap.server');

module.exports = async () => {
  await ldapServer.start();
  global.__LDAPSERVER__ = ldapServer;
};
