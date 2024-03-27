const express = require('express');
const router = express.Router();

const unitController = require('../controllers/unit.controller');

router.get('/', unitController.get);
router.get('/csv', unitController.getCsv);
router.get('/suggestions', unitController.getSuggestions);

module.exports = router;
