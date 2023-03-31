const express = require('express');

const app = express();
const portNumber = process.env.PORT || 5555;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(portNumber);
console.log(
  'Server listening on 0.0.0.0 port ' + portNumber +
  ' (http://0.0.0.0:' + portNumber + '/)'
);
