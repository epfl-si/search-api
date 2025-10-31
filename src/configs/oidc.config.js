const helper = require('../utils/helper.util');
const { Issuer, Strategy } = require('openid-client');

const oidc = {
  tenantId: helper.validateEnv('SEARCH_API_OIDC_TENANT_ID'),
  client_id: helper.validateEnv('SEARCH_API_OIDC_RP_CLIENT_ID'),
  client_secret: helper.validateEnv('SEARCH_API_OIDC_RP_CLIENT_SECRET'),
  redirect_uris: helper.validateEnv('SEARCH_API_OIDC_REDIRECT_URI')
};

function verify (tokenset, userinfo, done) {
  try {
    const claims = tokenset.claims();
    const displayName = [claims.given_name, claims.family_name]
      .filter(Boolean)
      .join(' ');
    const user = {
      displayName,
      sciper: claims.uniqueid,
      rawClaims: claims
    };
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}

async function createOidcStrategy () {
  const issuer = await Issuer.discover(
    `https://login.microsoftonline.com/${oidc.tenantId}/v2.0`
  );
  const client = new issuer.Client({
    client_id: oidc.client_id,
    client_secret: oidc.client_secret,
    redirect_uris: oidc.redirect_uris,
    response_types: ['code']
  });
  const params = { scope: 'openid' };
  const strategy = new Strategy({ client, params }, verify);
  return strategy;
}

module.exports = createOidcStrategy;
