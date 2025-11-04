const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');

router.get('/check', authController.check);
router.get('/login', authController.login);
router.get('/callback', authController.callback);
router.get('/logout', authController.logout);

module.exports = router;
