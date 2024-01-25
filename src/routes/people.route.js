const express = require('express');
const router = express.Router();

const configApi = require('../configs/api.config');

const peopleController = require('../controllers/people.controller');

if (configApi.enableLdap) {
  router.get('/', peopleController.get);
}
router.get('/suggestions/', peopleController.getSuggestions);

module.exports = router;
