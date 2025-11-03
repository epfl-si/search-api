const { verify } = require('../src/configs/oidc.config');
const validClaims = require('./resources/oidc/valid_claims.json');

describe('verify', () => {
  it('It should call done with user info', () => {
    const fakeTokenset = {
      claims: () => validClaims
    };
    const done = jest.fn();

    verify(fakeTokenset, {}, done);
    expect(done).toHaveBeenCalledWith(null, {
      displayName: `${validClaims.given_name} ${validClaims.family_name}`,
      sciper: validClaims.uniqueid,
      rawClaims: validClaims
    });
  });

  it('It should call done with error if claims() throws an error', () => {
    const fakeTokenset = {
      claims: () => {
        throw new Error('mislead');
      }
    };
    const done = jest.fn();

    verify(fakeTokenset, {}, done);
    expect(done).toHaveBeenCalledWith(expect.any(Error));
  });
});
