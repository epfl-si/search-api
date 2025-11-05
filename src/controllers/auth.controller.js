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
  req.session.redirect = new URLSearchParams({
    q: req.query.q || '',
    filter: req.query.filter || '',
    type: req.query.type || '',
    sort: req.query.sort || ''
  }).toString();
  passport.authenticate('oidc')(req, res, next);
}

function callback (req, res) {
  const params = req.session.redirect;
  passport.authenticate(
    'oidc', { failureRedirect: '/auth/login' })(req, res, () => {
    res.redirect(`${authConfig.searchUrl}?${params}`);
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
