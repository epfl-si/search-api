const util = require('../utils/helper.util');
const ldapUtil = require('../utils/ldap.util');
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
  const terms = name.split(/\s+/);
  const ldapQuery = ldapUtil.buildLdapQueryForPerson(util.permutations(terms));
  return getPerson(ldapQuery);
}

module.exports = {
  getPersonByEmail,
  getPersonByName,
  getPersonByPhone,
  getPersonBySciper
};
