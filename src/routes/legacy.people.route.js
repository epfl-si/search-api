const express = require('express');
const router = express.Router();

const peopleController = require('../controllers/people.controller');

router.get('/genericSearch', peopleController.getCsv);

module.exports = router;
