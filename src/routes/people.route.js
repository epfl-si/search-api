const express = require('express');
const router = express.Router();

const peopleController = require('../controllers/people.controller');

router.get('/', peopleController.get);
router.get('/csv', peopleController.getCsv);
router.get('/suggestions', peopleController.getSuggestions);

module.exports = router;
