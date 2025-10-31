const passport = require('passport');

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
  logout
};
