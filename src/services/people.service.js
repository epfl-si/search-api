const ldapService = require('../services/ldap.service');

function getPersonBySciper (sciper) {
  const baseFi = '&(objectClass=Person)(!(employeeType=Ignore)';
  const opts = {
    filter: `(${baseFi})(uniqueIdentifier=${sciper}))`,
    scope: 'sub'
  };
  return ldapService.searchAll('c=ch', opts);
};

module.exports = {
  getPersonBySciper
};
