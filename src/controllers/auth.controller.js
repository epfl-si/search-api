const authConfig = require('../configs/auth.config');

function check (req, res) {
  const status = {
    login: res.locals.authenticated,
    internal: res.locals.internal
  };
  return res.json(status);
}

function login (req, res) {
  const params = new URLSearchParams({
    q: req.query.q || '',
    filter: req.query.filter || '',
    type: req.query.type || '',
    sort: req.query.sort || ''
  });
  res.redirect(authConfig.searchUrl + '?' + params.toString());
}

function logout (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.json({ success: true });
  });
}

module.exports = {
  check,
  login,
  logout
};
