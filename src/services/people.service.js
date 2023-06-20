const ldapService = require('../services/ldap.service');

function getPersonByKey (key, val) {
  const baseFi = '&(objectClass=Person)(!(employeeType=Ignore))';
  const opts = {
    filter: `(${baseFi}(${key}=${val}))`,
    scope: 'sub'
  };
  return ldapService.searchAll('c=ch', opts);
}

function getPersonByEmail (mail) {
  return getPersonByKey('mail', mail);
};

function getPersonBySciper (sciper) {
  return getPersonByKey('uniqueIdentifier', sciper);
};

function getPersonByPhone (number) {
  return getPersonByKey('telephoneNumber', `*${number}`);
}

module.exports = {
  getPersonByEmail,
  getPersonByPhone,
  getPersonBySciper
};
