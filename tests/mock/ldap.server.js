const ldap = require('ldapjs');

const directory = require('../resources/ldap/directory.json');

const port = 1389;
const server = ldap.createServer();

server.search('o=epfl', searchHandler);

function searchHandler (req, res, next) {
  directory.forEach(function (user) {
    if (user.dn.indexOf(req.dn.toString()) === -1) {
      return;
    }

    if (req.filter.matches(user.attributes)) {
      res.send(user);
    }
  });

  res.end();
  return next();
}

function start () {
  server.listen(port, () => {});
}

function stop () {
  server.close();
}

module.exports = {
  start,
  stop
};
