const path = require('path');
const express = require('express');
const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 404
app.use(function (req, res, next) {
  res.status(404).render('404');
});

module.exports = app;
