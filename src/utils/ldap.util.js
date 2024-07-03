/**
 * Utility functions for LDAP.
 *
 * @module utils/ldap
 */

const util = require('./helper.util');

const ldapUserMapper = {
  mail: ['email', (val) => val[0]],
  sn: ['name', (val) => val],
  givenName: ['firstname', (val) => val],
  displayName: ['displayName', (val) => val[0]]
};

function newLdapAccredMapper (lang) {
  const ldapAccredMapper = {
    EPFLAccredOrder: ['order', (val) => parseInt(val[0])],
    roomNumber: ['officeList', (val) => val],
    telephoneNumber: ['phoneList', (val) => val]
  };
  if (lang === 'en') {
    ldapAccredMapper['description;lang-en'] = ['position', (val) => val[0]];
    ldapAccredMapper['ou;lang-en'] = ['name', (val) => val[0]];
  } else {
    ldapAccredMapper.description = ['position', (val) => val[0]];
    ldapAccredMapper.ou = ['name', (val) => val[1]];
  }
  return ldapAccredMapper;
}

function newLdapAddressMapper () {
  const ldapAddressMapper = {
    roomNumber: ['officeList', (val) => val],
    postalAddress: ['fullAddress', (val) => val[0]],
    postalCode: ['postalCode', (val) => val[0]],
    postOfficeBox: ['postOfficeBox', (val) => val[0]]
  };
  return ldapAddressMapper;
}

function sortAccreds (obj) {
  return obj.sort((a, b) => a.order - b.order);
}

function score (a, q) {
  let points = 0;
  const attributes = ['name', 'firstname'];
  const terms = util.removeAccents(q).split(/\s+/);
  for (let term of terms) {
    term = term.toLowerCase();
    for (const attr of attributes) {
      const name = util.removeAccents(a[attr]).toLowerCase();
      const subnames = name.split(/\s+/);
      if (name === term && attr === 'name') {
        points += 100;
      } else if (name === term && attr === 'firstname') {
        points += 99;
      } else if (subnames.includes(term)) {
        points += 49;
      } else if (name.startsWith(term) && attr === 'name') {
        points += 2;
      } else if (name.startsWith(term) && attr === 'firstname') {
        points += 1;
      }
    }
  }
  return points;
}

function sortPersons (obj, q) {
  const scores = obj.map(a => ({ p: a, score: score(a, q) }));
  return scores.sort((a, b) =>
    b.score - a.score ||
    a.p.name.localeCompare(b.p.name) ||
    a.p.firstname.localeCompare(b.p.firstname)
  ).map(scores => scores.p);
}

/**
 * Build the LDAP query to search persons by name.
 *
 * @example
 * const ldapUtil = require('../utils/ldap.util');
 * const array = [ [ 'Jango' ]];
 * ldapUtil.buildLdapQueryForPerson(array);
 * // => '(|(displayName=*Jango*)))'
 *
 * @example
 * const array = [ [ 'Fett', 'Boba' ], [ 'Boba', 'Fett' ] ];
 * ldapUtil.buildLdapQueryForPerson(array);
 * // => '(|(displayName=*Fett*Boba*)(displayName=*Boba*Fett*))'
 *
 * @example
 * const array = [
 *  [ 'Bo', 'Katan', 'Kryze' ], [ 'Bo', 'Kryze', 'Katan' ],
 *  [ 'Katan', 'Bo', 'Kryze' ], [ 'Katan', 'Kryze', 'Bo' ],
 *  [ 'Kryze', 'Bo', 'Katan' ], [ 'Kryze', 'Katan', 'Bo' ]
 * ];
 * ldapUtil.buildLdapQueryForPerson(array);
 * // => '(|(displayName=*Bo*Katan*Kryze*)(displayName=*Bo*Kryze*Katan*) \
 *          (displayName=*Katan*Bo*Kryze*)(displayName=*Katan*Kryze*Bo*) \
 *          (displayName=*Kryze*Bo*Katan*)(displayName=*Kryze*Katan*Bo*))'
 *
 * @param {array} array An array of array with terms permutations.
 * @returns {string} Return the LDAP query.
 */
function buildLdapQueryForPerson (array) {
  let ldapQuery = '';
  for (const terms of array) {
    ldapQuery += `(cn=*${terms.join('*')}*)`;
  }
  return `(|${ldapQuery})`;
}

/**
 * Transform dn to acronym (unit).
 *
 * @example
 * const ldapUtil = require('../utils/ldap.util');
 * ldapUtil.dn2acronym('');  // => ''
 *
 * @example
 * const dn = 'cn=Boba Fett,ou=bespin,ou=ep-5,ou=ot,o=epfl,c=ch';
 * ldapUtil.dn2acronym(dn);  // => 'BESPIN'
 *
 * @param {string} dn A string representing the dn from LDAP.
 * @returns {string} Return the acronym (unit).
 */
function dn2acronym (dn) {
  const a = dn.split(/.?ou=/g);
  return a.length > 1 ? a[1].toUpperCase() : '';
}

/**
 * Transform dn to path (unit).
 *
 * @example
 * const ldapUtil = require('../utils/ldap.util');
 * ldapUtil.dn2path('');  // => ''
 *
 * @example
 * const dn = 'cn=Boba Fett,ou=bespin,ou=ep-5,ou=ot,o=epfl,c=ch';
 * ldapUtil.dn2path(dn);  // => 'EPFL/OT/EP-5/BESPIN'
 *
 * @param {string} dn A string representing the dn from LDAP.
 * @returns {string} Return the path (unit).
 */
function dn2path (dn) {
  return dn
    .split(',')
    .splice(1, 4)
    .reverse()
    .map(x => x.replace(/ou?=/g, ''))
    .join('/')
    .toUpperCase();
}

/**
 * Retrieve the correct firstname and name.
 *
 * @example
 * const ldapUtil = require('../utils/ldap.util');
 * ldapUtil.getCorrectNames(['Alpha', 'Boba'], ['Fett'], 'Boba Fett');
 *
 * @param {*} firstnames A list of firstname.
 * @param {*} names A list of name.
 * @param {*} displayName The correct display name to use.
 * @returns {array} Return the correct firstname and name.
 */
function getCorrectName (firstnames, names, displayName) {
  for (const fn of firstnames) {
    for (const n of names) {
      const dn = `${fn} ${n}`;
      if (dn === displayName) {
        return [fn, n];
      }
    }
  }
}

/**
 * Build profile link to people.epfl.ch.
 *
 * @example
 * const ldapUtil = require('../utils/ldap.util');
 * ldapUtil.getProfile('boba.fett@star.ch', '670001');  // => '670001'
 * ldapUtil.getProfile('boba.fett@epfl.ch', '670001');  // => 'boba.fett'
 *
 * @param {string} mail A valid email address.
 * @param {string} sciper 6-digit unique EPFL identification number.
 * @returns {string} firstname.name if person has epfl mail, sciper otherwise.
 */
function getProfile (mail, sciper) {
  return /.+\..+@epfl\.ch/.test(mail) ? mail.replace('@epfl.ch', '') : sciper;
}

/**
 * Convert LDAP search result into API result.
 *
 * @example
 * const ldapUtil = require('../utils/ldap.util');
 * const persons = ldapUtil.ldap2api(ldapResults, 'Fett', 'en');
 *
 * @param {object} ldapResults The result from the LDAP search.
 * @param {string} q The query.
 * @param {string} hl The user interface language.
 * @returns {object} Return the result for the API.
 */
function ldap2api (ldapResults, q, hl) {
  const list = [];
  const ldapAccredMapper = newLdapAccredMapper(hl);

  for (const [sciper, entry] of Object.entries(ldapResults)) {
    const person = { sciper, rank: 0 };
    const listAccreds = [];
    for (let acc = 0; acc < entry.length; acc++) {
      const accred = {
        phoneList: [],
        officeList: [],
        path: dn2path(entry[acc].objectName),
        acronym: dn2acronym(entry[acc].objectName)
      };
      for (let att = 0; att < entry[acc].attributes.length; att++) {
        if (entry[acc].attributes[att].type in ldapUserMapper) {
          person[ldapUserMapper[entry[acc].attributes[att].type][0]] =
            ldapUserMapper[
              entry[acc].attributes[att].type
            ][1](entry[acc].attributes[att].values);
        }
        if (entry[acc].attributes[att].type in ldapAccredMapper) {
          accred[ldapAccredMapper[entry[acc].attributes[att].type][0]] =
            ldapAccredMapper[
              entry[acc].attributes[att].type
            ][1](entry[acc].attributes[att].values);
        }
      }
      accred.rank = accred.order > 1 ? 1 : 0;
      listAccreds.push(accred);
    }
    const correctName = getCorrectName(
      person.firstname,
      person.name,
      person.displayName
    );
    person.firstname = correctName[0];
    person.name = correctName[1];
    delete person.displayName;
    person.accreds = sortAccreds(listAccreds);
    person.profile = getProfile(person.email, sciper);
    list.push(person);
  }
  return sortPersons(list, q);
}

/**
 * Convert LDAP Address search result into API result.
 *
 * @example
 * const ldapUtil = require('../utils/ldap.util');
 * const address = ldapUtil.ldapAddress2api(ldapResults, 'Fett');
 *
 * @param {object} ldapResults The result from the LDAP Address search.
 * @param {string} q The query.
 * @returns {object} Return the result for the API.
 */
function ldapAddress2api (ldapResults) {
  const ldapAddressMapper = newLdapAddressMapper();
  const person = {};

  for (const [sciper, entry] of Object.entries(ldapResults)) {
    person.sciper = sciper;
    const listAccreds = [];
    for (let acc = 0; acc < entry.length; acc++) {
      const accred = {
        officeList: [],
        path: dn2path(entry[acc].objectName),
        acronym: dn2acronym(entry[acc].objectName)
      };
      for (let att = 0; att < entry[acc].attributes.length; att++) {
        if (entry[acc].attributes[att].type in ldapAddressMapper) {
          accred[ldapAddressMapper[entry[acc].attributes[att].type][0]] =
            ldapAddressMapper[
              entry[acc].attributes[att].type
            ][1](entry[acc].attributes[att].values);
        }
      }
      listAccreds.push(accred);
    }
    person.accreds = sortAccreds(listAccreds);
  }
  return person;
}

module.exports = {
  buildLdapQueryForPerson,
  dn2acronym,
  dn2path,
  getCorrectName,
  getProfile,
  ldap2api,
  ldapAddress2api
};
