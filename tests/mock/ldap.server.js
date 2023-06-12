const ldap = require('ldapjs');

const directory = require('../resources/ldap/directory.json');

const port = 1389;
const server = ldap.createServer();

server.search('o=epfl', searchHandler);

/*
  Examples queries:

  > ldapsearch -H ldap://localhost:1389 -x \
      -LLL -b "o=epfl" uniqueIdentifier=670001

  > ldapsearch -H ldap://localhost:1389 -x \
      -LLL -b "o=epfl" sn=Fett
*/
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
