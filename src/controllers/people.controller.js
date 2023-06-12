const ldapUtil = require('../utils/ldap.util');
const peopleService = require('../services/people.service');

function ldapMapper (results) {
  const ldmap = {
    mail: ['email', (val) => val[0]],
    sn: ['name', (val) => val[0]],
    givenName: ['firstname', (val) => val[0]]
  };
  const ldamap = {
    ou: ['name', (val) => val[1]],
    EPFLAccredOrder: ['rank', (val) => val[0]],
    title: ['position', (val) => val[0]],
    roomNumber: ['officeList', (val) => val],
    telephoneNumber: ['phoneList', (val) => val]
  };
  const list = [];

  for (const [sciper, entry] of Object.entries(results)) {
    const person = { sciper, rank: 0 };
    const listAccreds = [];
    for (let acc = 0; acc < entry.length; acc++) {
      console.log(entry);
      const accred = {
        phoneList: [],
        officeList: [],
        path: ldapUtil.dn2path(entry[acc].objectName),
        acronym: ldapUtil.dn2acronym(entry[acc].objectName)
      };
      for (let att = 0; att < entry[acc].attributes.length; att++) {
        if (entry[acc].attributes[att].type in ldmap) {
          // console.log(ldmap[entry[acc].attributes[att].type][1](entry[acc].attributes[att].values));
          person[ldmap[entry[acc].attributes[att].type][0]] = ldmap[entry[acc].attributes[att].type][1](entry[acc].attributes[att].values);
        }
        if (entry[acc].attributes[att].type in ldamap) {
          // console.log(ldmap[entry[acc].attributes[att].type][1](entry[acc].attributes[att].values));
          accred[ldamap[entry[acc].attributes[att].type][0]] = ldamap[entry[acc].attributes[att].type][1](entry[acc].attributes[att].values);
        }
      }
      listAccreds.push(accred);
    }
    person.accreds = listAccreds;
    list.push(person);
  }
  return list;
}

async function get (req, res) {
  const q = req.query.q || '';
  if (q.length < 2) {
    return res.json([]);
  }

  try {
    const results = await peopleService.getPersonBySciper(q);
    const mappedResults = ldapMapper(results);
    console.log(JSON.stringify(mappedResults));
    return res.json(mappedResults);
    // return res.json(results);
  } catch (err) {
    console.error('[error] ', err.message);
    return res.status(400).json({
      success: false,
      error: 'Oops, something went wrong'
    });
  }
}

module.exports = {
  get
};
