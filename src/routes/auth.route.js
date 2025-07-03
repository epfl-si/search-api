const tequila = require('../configs/tequila.config');

const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');

router.get('/check', authController.check);
router.get('/login', tequila.ensureAuthenticated, authController.login);
router.get('/logout', authController.logout);

module.exports = router;
