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
  const term = name.split(/\s+/);

  if (term.length === 2) {
    const filter = `(displayName=*${term.join('*')}*)`;
    term.reverse();
    return getPerson(
      `(|${filter}(displayName=*${term.join('*')}*))`
    );
  } else {
    return getPerson(`(|(displayName=*${term[0]}*))`);
  }
}

module.exports = {
  getPersonByEmail,
  getPersonByName,
  getPersonByPhone,
  getPersonBySciper
};
