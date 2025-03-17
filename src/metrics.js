const morgan = require('morgan');
const express = require('express');

const metricsApp = express();

// Log
metricsApp.use(
  morgan('combined', { skip: (req, res) => process.env.NODE_ENV === 'test' })
);

module.exports = metricsApp;
