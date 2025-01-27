const express = require('express');
const router = express.Router();

const semanticController = require('../controllers/semantic.controller');

router.get('/', semanticController.get);
router.get('/v2/', semanticController.getv2);

module.exports = router;
