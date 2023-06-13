const ldapService = require('../services/ldap.service');

function getPersonBySciper (sciper) {
  const opts = {
    filter: '(&(objectClass=Person)(uniqueIdentifier=' + sciper + '))',
    scope: 'sub'
  };
  return ldapService.searchAll('c=ch', opts);
};

module.exports = {
  getPersonBySciper
};
