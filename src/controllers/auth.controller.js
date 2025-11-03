const passport = require('passport');
const authConfig = require('../configs/auth.config');

function check (req, res) {
  const status = {
    login: res.locals.authenticated,
    internal: res.locals.internal
  };
  if (res.locals.user?.sciper) {
    status.user = res.locals.user;
  }
  return res.json(status);
}

function login (req, res, next) {
  const params = new URLSearchParams({
    q: req.query.q || '',
    filter: req.query.filter || '',
    type: req.query.type || '',
    sort: req.query.sort || ''
  }).toString();
  res.cookie('returnTo', params, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 300000
  });
  passport.authenticate('oidc')(req, res, next);
}

function callback (req, res, next) {
  passport.authenticate(
    'oidc', { failureRedirect: '/auth/login' })(req, res, () => {
    const redirectTo = req.cookies?.returnTo || '';
    if (req.cookies?.returnTo) res.clearCookie('returnTo');
    const url = redirectTo
      ? `${authConfig.searchUrl}?${redirectTo}`
      : authConfig.searchUrl;
    res.redirect(url);
  });
}

function logout (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.session.destroy(() => {
      res.clearCookie('search');
      res.json({ success: true });
    });
  });
}

module.exports = {
  check,
  login,
  callback,
  logout
};
