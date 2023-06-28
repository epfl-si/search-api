const ldapConfig = require('../configs/ldap.config');
const ldapService = require('../services/ldap.service');

const rootsFilter = ldapConfig.filter.roots;

function getPerson (filter) {
  const baseFi = `&(objectClass=Person)${rootsFilter}(!(employeeType=Ignore))`;
  const opts = {
    filter: `(${baseFi}${filter})`,
    scope: 'sub'
  };
  return ldapService.searchAll(ldapConfig.filter.base, opts);
}

function getPersonByEmail (mail) {
  return getPerson(`(mail=${mail})`);
};

function getPersonBySciper (sciper) {
  return getPerson(`(uniqueIdentifier=${sciper})`);
};

function getPersonByPhone (number) {
  return getPerson(`(telephoneNumber=*${number})`);
}

function getPersonByName (name) {
  return getPerson(
    `(|(sn=${name}*)(sn=*${name})(givenName=${name}*)(givenName=*${name}))`
  );
}

module.exports = {
  getPersonByEmail,
  getPersonByName,
  getPersonByPhone,
  getPersonBySciper
};
