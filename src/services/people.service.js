const ldapConfig = require('../configs/ldap.config');
const ldapService = require('../services/ldap.service');

const rootsFilter = ldapConfig.filter.roots;

function getPersonByKey (key, val) {
  const baseFi = `&(objectClass=Person)${rootsFilter}(!(employeeType=Ignore))`;
  const opts = {
    filter: `(${baseFi}(${key}=${val}))`,
    scope: 'sub'
  };
  return ldapService.searchAll(ldapConfig.filter.base, opts);
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
