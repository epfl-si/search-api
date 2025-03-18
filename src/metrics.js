const morgan = require('morgan');
const express = require('express');

const metricsApp = express();

// Log
metricsApp.use(morgan('combined'));

module.exports = metricsApp;
