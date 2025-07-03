const authConfig = require('../configs/auth.config');

function isInsideEPFL (req) {
  return req.get('X-EPFL-Internal') === 'TRUE' ||
    authConfig.internal === 'True';
}

function setUserInfo (req, res, next) {
  res.locals.authenticated = req.isAuthenticated();
  res.locals.internal = isInsideEPFL(req);
  next();
}

module.exports = {
  setUserInfo
};
