const express = require('express');
const router = express.Router();

const unitController = require('../controllers/unit.controller');

router.get('/', unitController.get);

module.exports = router;
