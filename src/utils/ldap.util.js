/**
 * Utility functions for LDAP.
 *
 * @module utils/ldap
 */

const ldapUserMapper = {
  mail: ['email', (val) => val[0]],
  sn: ['name', (val) => val[0]],
  givenName: ['firstname', (val) => val[0]]
};

function newLdapAccredMapper (lang) {
  const ldapAccredMapper = {
    EPFLAccredOrder: ['rank', (val) => val[0]],
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

function sortAccreds (obj) {
  return obj.sort((a, b) => a.rank - b.rank);
}

function score (a, q) {
  let points = 0;
  if (a.name.toLowerCase() === q.toLowerCase()) {
    points += 1;
  }
  if (a.firstname.toLowerCase() === q.toLowerCase()) {
    points += 1;
  }
  return points;
}

function sortPersons (obj, q) {
  return obj.sort((a, b) =>
    score(b, q) - score(a, q) ||
    a.name.localeCompare(b.name) ||
    a.firstname.localeCompare(b.firstname)
  );
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
 * const persons = ldapUtil.ldap2api(ldapResults);
 *
 * @param {object} ldapResults The result from the LDAP search.
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
      listAccreds.push(accred);
    }
    person.accreds = sortAccreds(listAccreds);
    person.profile = getProfile(person.email, sciper);
    list.push(person);
  }
  return sortPersons(list, q);
}

module.exports = {
  dn2acronym,
  dn2path,
  getProfile,
  ldap2api
};
