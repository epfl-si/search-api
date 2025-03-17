const app = require('./app');
const metricsApp = require('./metrics');
const port = process.env.PORT || 5555;
const mPort = process.env.MPORT || 5556;

app.listen(port);
console.log(
  `Server listening on 0.0.0.0 port ${port} (http://0.0.0.0:${port}/)`
);

metricsApp.listen(mPort);
console.log(
  `Metrics listening on 0.0.0.0 port ${mPort} (http://0.0.0.0:${mPort}/)`
);
