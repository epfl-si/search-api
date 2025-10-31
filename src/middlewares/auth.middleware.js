const authConfig = require('../configs/auth.config');

function isInsideEPFL (req) {
  return req.get('X-EPFL-Internal') === 'TRUE' ||
    authConfig.internal === 'True';
}

function setUserInfo (req, res, next) {
  res.locals.authenticated = req.isAuthenticated();
  res.locals.internal = isInsideEPFL(req);

  if (req.user) {
    res.locals.user = {
      displayName: req.user?.displayName,
      sciper: req.user?.sciper
    };
  } else {
    res.locals.user = null;
  }

  next();
}

module.exports = {
  setUserInfo
};
