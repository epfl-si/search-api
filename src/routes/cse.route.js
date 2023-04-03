const express = require('express');
const router = express.Router();

const cseService = require('../services/cse.service');

router.get('/', cseService.get);

module.exports = router;
