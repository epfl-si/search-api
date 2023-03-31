const app = require('./app');
const port = process.env.PORT || 5555;

app.listen(port);
console.log(
  `Server listening on 0.0.0.0 port ${port} (http://0.0.0.0:${port}/)`
);
