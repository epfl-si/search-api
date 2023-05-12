const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const express = require('express');

const cseRouter = require('./routes/cse.route');
const semanticRouter = require('./routes/semantic.route');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('x-powered-by', false);

app.use(cors({ origin: '*' }));

// Security
app.use(helmet.frameguard());
app.use(helmet.noSniff());
app.use(helmet.referrerPolicy({ policy: 'same-origin' }));

// Google CSE
app.use('/api/cse', cseRouter);

// EPFL Graph
app.use('/api/graphsearch', semanticRouter);

// 404
app.use(function (req, res, next) {
  res.status(404).render('404');
});

module.exports = app;
