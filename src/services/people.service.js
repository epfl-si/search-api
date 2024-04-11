const util = require('../utils/helper.util');
const ldapUtil = require('../utils/ldap.util');
const ldapConfig = require('../configs/ldap.config');

const ldapService = require('./ldap.service');
const cadidbService = require('./cadidb.service');

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
  const term = util.removeAccents(name);
  const terms = term.split(/\s+/);
  const ldapQuery = ldapUtil.buildLdapQueryForPerson(util.permutations(terms));
  return getPerson(ldapQuery);
}

async function getUnits () {
  const query = 'SELECT sigle, id_unite FROM Unites_v2';
  return await cadidbService.sendQuery(query, '', 'getUnits');
}

module.exports = {
  getPersonByEmail,
  getPersonByName,
  getPersonByPhone,
  getPersonBySciper,
  getUnits
};
