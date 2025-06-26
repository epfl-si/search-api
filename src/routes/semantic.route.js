const express = require('express');
const router = express.Router();

const semanticController = require('../controllers/semantic.controller');

router.get('/v2/', semanticController.get);

module.exports = router;
