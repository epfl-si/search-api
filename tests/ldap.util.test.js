const ldapUtil = require('../src/utils/ldap.util');

describe('Test LDAP utilities', () => {
  test('It should transform a dn to an acronym', () => {
    let acronym = ldapUtil.dn2acronym('');
    expect(acronym).toEqual('');

    acronym = ldapUtil.dn2acronym(
      'cn=Boba Fett,ou=bespin,ou=ep-5,ou=ot,o=epfl,c=ch'
    );
    expect(acronym).toEqual('BESPIN');
  });

  test('It should transform a dn to a path', () => {
    let path = ldapUtil.dn2path('');
    expect(path).toEqual('');

    path = ldapUtil.dn2path(
      'cn=Boba Fett,ou=bespin,ou=ep-5,ou=ot,o=epfl,c=ch'
    );
    expect(path).toEqual('EPFL/OT/EP-5/BESPIN');
  });

  test('It should get the profile', () => {
    let profile = ldapUtil.getProfile('boba.fett@sw.ch', '670001');
    expect(profile).toEqual('670001');

    profile = ldapUtil.getProfile('boba.fett@epfl.ch', '670001');
    expect(profile).toEqual('boba.fett');
  });

  test('It should get the correct name', () => {
    const firstnames = ['Alpha', 'Boba'];
    const names = ['Fett'];
    const displayName = 'Boba Fett';
    const correctName = ldapUtil.getCorrectName(firstnames, names, displayName);
    expect(correctName).toEqual(['Boba', 'Fett']);
  });
});
