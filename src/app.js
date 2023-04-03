const express = require('express');
const app = express();

const cseRouter = require('./routes/cse.route');

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/cse', cseRouter);

module.exports = app;
