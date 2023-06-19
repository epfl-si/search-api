const ldapUserMapper = {
  mail: ['email', (val) => val[0]],
  sn: ['name', (val) => val[0]],
  givenName: ['firstname', (val) => val[0]]
};

const ldapAccredMapper = {
  ou: ['name', (val) => val[1]],
  EPFLAccredOrder: ['rank', (val) => val[0]],
  title: ['position', (val) => val[0]],
  roomNumber: ['officeList', (val) => val],
  telephoneNumber: ['phoneList', (val) => val]
};

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
 * ldapUtil.dn2path('');  // => 'EPFL/OT/EP-5/BESPIN'
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

function ldap2api (ldapResults) {
  const list = [];

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
    person.accreds = listAccreds;
    list.push(person);
  }
  return list;
}

module.exports = {
  dn2acronym,
  dn2path,
  ldap2api
};