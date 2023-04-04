const express = require('express');
const router = express.Router();

const cseController = require('../controllers/cse.controller');

router.get('/', cseController.get);

module.exports = router;
