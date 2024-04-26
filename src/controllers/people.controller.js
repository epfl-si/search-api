const ldapUtil = require('../utils/ldap.util');
const appCache = require('../services/cache.service');
const apimdService = require('../services/apimd.service');
const peopleService = require('../services/people.service');

function removeSpecialChars (q) {
  return q.replace(/[()]/g, '');
}

async function checkRoom (query) {
  const room = query.replace(' ', '').replace('.', '');
  if (!/^[A-Z].*[0-9]/i.test(room)) {
    return false;
  }
  const results = await apimdService.getRooms(query);
  return results.data.rooms.length > 0;
}

function listSciper (apiResults) {
  const sciperList = [];
  for (const p of apiResults) {
    sciperList.push(p.sciper);
  }
  return sciperList;
}

async function buildHashUnit () {
  const unitHash = {};
  const units = await peopleService.getUnits();
  for (const unit of units) {
    unitHash[unit.sigle] = unit.id_unite;
  }
  return unitHash;
}

async function buildHashPhoneRoom (apiResults) {
  const persons = await apimdService.getPersonsBySciper(listSciper(apiResults));

  const phoneHash = {};
  const roomHash = {};
  for (const person of persons.data.persons) {
    phoneHash[person.id] = {};
    roomHash[person.id] = {};
    if ('phones' in person) {
      for (const phone of person.phones) {
        if (!(phone.unitid in phoneHash[person.id])) {
          phoneHash[person.id][phone.unitid] = [];
        }
        if (phone.hidden === 0) {
          phoneHash[person.id][phone.unitid].push(phone.number);
        }
      }
    }
    if ('rooms' in person) {
      for (const room of person.rooms) {
        if (!(room.unitid in roomHash[person.id])) {
          roomHash[person.id][room.unitid] = [];
        }
        if (room.hidden === 0 && room.name !== '') {
          roomHash[person.id][room.unitid].push(room.name);
        }
      }
    }
  }
  return [phoneHash, roomHash];
}

async function search (query, lang) {
  let ldapResults = [];
  if (/^[0-9]{6}$/.test(query)) {
    ldapResults = await peopleService.getPersonBySciper(query);
  } else if (/^\+?[0-9 ]+$/.test(query)) {
    ldapResults = await peopleService.getPersonByPhone(query);
  } else if (/^[^@]+@[^@]+$/.test(query)) {
    ldapResults = await peopleService.getPersonByEmail(query);
  } else {
    const isRoom = await checkRoom(query);
    if (isRoom) {
      ldapResults = await peopleService.getPersonByRoom(query);
    } else {
      ldapResults = await peopleService.getPersonByName(query);
    }
  }

  // Keep only the 1st 1000 results.
  return ldapUtil.ldap2api(
    ldapResults,
    query,
    lang
  ).slice(0, 1000);
}

async function get (req, res) {
  if (appCache.has(req.originalUrl)) {
    return res.send(appCache.get(req.originalUrl));
  } else {
    let q = req.query.q || '';
    q = removeSpecialChars(q);
    if (q.length < 2) {
      return res.json([]);
    }

    try {
      const apiResults = await search(q, req.query.hl);
      if (apiResults.length) {
        const unitHash = await buildHashUnit();
        const [phoneHash, roomHash] = await buildHashPhoneRoom(apiResults);

        // Add code and fix phones and rooms
        for (const person of apiResults) {
          for (const accred of person.accreds) {
            const code = unitHash[accred.acronym];
            accred.code = code;
            accred.phoneList = phoneHash[person.sciper][code] || [];
            accred.officeList = roomHash[person.sciper][code] || [];
          }
        }
      }
      appCache.set(req.originalUrl, apiResults);
      return res.json(apiResults);
    } catch (err) {
      console.error('[error] ', err.message);
      return res.status(400).json({
        success: false,
        error: 'Oops, something went wrong'
      });
    }
  }
}

async function getCsv (req, res) {
  res.setHeader('Content-Type', 'text/plain');

  if (appCache.has(req.originalUrl)) {
    return res.send(appCache.get(req.originalUrl));
  } else {
    let q = req.query.q || '';
    q = removeSpecialChars(q);
    if (q.length < 2) {
      return res.send('');
    }

    try {
      let csv = '';
      const apiResults = await search(q, req.query.hl);
      if (apiResults.length) {
        for (const person of apiResults) {
          csv += [person.sciper, person.firstname, person.name].join(': ');
          csv += '\n';
        }
      }
      appCache.set(req.originalUrl, csv);
      return res.send(csv);
    } catch (err) {
      console.error('[error] ', err.message);
      return res.status(400).send('Oops, something went wrong');
    }
  }
}

async function getSuggestions (req, res) {
  if (appCache.has(req.originalUrl)) {
    return res.send(appCache.get(req.originalUrl));
  } else {
    // Max and default 10 suggestions
    let limit = req.query.limit || 10;
    limit = limit > 10 ? 10 : limit;

    let q = req.query.q || '';
    q = removeSpecialChars(q);
    if (q.length < 2) {
      return res.json([q, []]);
    }

    try {
      const ldapResults = await peopleService.getPersonByName(q);
      const results = ldapUtil.ldap2api(ldapResults, q, 'en').slice(0, limit);
      const suggestions = [];
      for (const person of results) {
        suggestions.push(`${person.firstname} ${person.name}`);
      }
      appCache.set(req.originalUrl, [q, suggestions]);
      return res.json([q, suggestions]);
    } catch (err) {
      console.error('[error] ', err.message);
      return res.status(400).json({
        success: false,
        error: 'Oops, something went wrong'
      });
    }
  }
}

module.exports = {
  get,
  getCsv,
  getSuggestions
};
