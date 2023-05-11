const path = require('path');
const express = require('express');
const app = express();

const cseRouter = require('./routes/cse.route');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('x-powered-by', false);

// Google CSE
app.use('/api/cse', cseRouter);

// 404
app.use(function (req, res, next) {
  res.status(404).render('404');
});

module.exports = app;
