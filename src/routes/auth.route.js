const express = require('express');
const passport = require('passport');
const router = express.Router();

const authConfig = require('../configs/auth.config');
const authController = require('../controllers/auth.controller');

router.get('/check', authController.check);
router.get('/login', authController.login);
router.get('/oidc/callback',
  passport.authenticate('oidc', { failureRedirect: '/auth/login' }),
  (req, res) => {
    const redirectTo = req.cookies?.returnTo || '';
    if (req.cookies?.returnTo) res.clearCookie('returnTo');

    const url = redirectTo
      ? `${authConfig.searchUrl}?${redirectTo}`
      : authConfig.searchUrl;
    res.redirect(url);
  }
);
router.get('/logout', authController.logout);

module.exports = router;
