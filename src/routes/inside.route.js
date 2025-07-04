const express = require('express');
const nocache = require('nocache');

const router = express.Router();

const insideController = require('../controllers/inside.controller');

router.get('/', nocache(), insideController.get);

module.exports = router;
