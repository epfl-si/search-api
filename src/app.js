const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const express = require('express');
const compression = require('compression');

const configApi = require('./configs/api.config');

const cseRouter = require('./routes/cse.route');
const peopleRouter = require('./routes/people.route');
const unitRouter = require('./routes/unit.route');
const semanticRouter = require('./routes/semantic.route');
const addressRouter = require('./routes/address.route');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('x-powered-by', false);

// Gzip all responses > 1kb
app.use(compression());

// Log
app.use(
  morgan('combined', { skip: (req, res) => process.env.NODE_ENV === 'test' })
);

app.use(cors({ origin: '*' }));

// Security
app.use(helmet.frameguard());
app.use(helmet.noSniff());
app.use(helmet.referrerPolicy({ policy: 'same-origin' }));

// Google CSE
if (configApi.enableCse) {
  app.use('/api/cse', cseRouter);
}

// People
if (configApi.enableLdap) {
  app.use('/api/ldap', peopleRouter);
}

// Address
if (configApi.enableAddress) {
  app.use('/api/address', addressRouter);
}

// Unit
if (configApi.enableUnit) {
  app.use('/api/unit', unitRouter);
}

// EPFL Graph
if (configApi.enableGraphsearch) {
  app.use('/api/graphsearch', semanticRouter);
}

// Liveness probe
app.use('/healthz', function (req, res) {
  res.send('OK');
});

// 404
app.use(function (req, res, next) {
  res.status(404).render('404');
});

module.exports = app;
