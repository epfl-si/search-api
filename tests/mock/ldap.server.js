const ldap = require('ldapjs');

const port = 1389;
const server = ldap.createServer();

server.start = () => {
  return new Promise((resolve, reject) => {
    server.listen(port, (error) => {
      if (error) {
        return reject(error);
      }
      resolve(server.address().port);
    });
  });
};

server.stop = () => {
  server.close();
};

module.exports = server;
