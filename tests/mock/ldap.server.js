const ldap = require('ldapjs');

const directory = require('../resources/ldap/directory.json');

const port = 1389;
const server = ldap.createServer();

server.search('c=ch', searchHandler);

/*
  Examples queries:

  > ldapsearch -H ldap://localhost:1389 -x \
      -LLL -b "c=ch" uniqueIdentifier=670001

  > ldapsearch -H ldap://localhost:1389 -x \
      -LLL -b "c=ch" sn=Fett
*/
function searchHandler (req, res, next) {
  directory.forEach(function (user) {
    /*
      This test is pretty dumb, make sure in the directory that things are
      spaced / cased exactly.
    */
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
