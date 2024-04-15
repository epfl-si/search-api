const ldapUtil = require('../utils/ldap.util');
const appCache = require('../services/cache.service');
const apimdService = require('../services/apimd.service');
const peopleService = require('../services/people.service');

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
        phoneHash[person.id][phone.unitid].push(phone.number);
      }
    }
    if ('rooms' in person) {
      for (const room of person.rooms) {
        if (!(room.unitid in roomHash[person.id])) {
          roomHash[person.id][room.unitid] = [];
        }
        roomHash[person.id][room.unitid].push(room.name);
      }
    }
  }
  return [phoneHash, roomHash];
}

async function get (req, res) {
  const q = req.query.q || '';
  if (q.length < 2) {
    return res.json([]);
  }

  try {
    let ldapResults = [];
    if (/^[0-9]{6}$/.test(q)) {
      ldapResults = await peopleService.getPersonBySciper(q);
    } else if (/^\+?[0-9 ]+$/.test(q)) {
      ldapResults = await peopleService.getPersonByPhone(q);
    } else if (/^[^@]+@[^@]+$/.test(q)) {
      ldapResults = await peopleService.getPersonByEmail(q);
    } else {
      const isRoom = await checkRoom(q);
      if (isRoom) {
        ldapResults = await peopleService.getPersonByRoom(q);
      } else {
        ldapResults = await peopleService.getPersonByName(q);
      }
    }

    // Keep only the 1st 1000 results.
    const apiResults = ldapUtil.ldap2api(
      ldapResults,
      q,
      req.query.hl
    ).slice(0, 1000);

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

    return res.json(apiResults);
  } catch (err) {
    console.error('[error] ', err.message);
    return res.status(400).json({
      success: false,
      error: 'Oops, something went wrong'
    });
  }
}

async function getSuggestions (req, res) {
  if (appCache.has(req.originalUrl)) {
    return res.send(appCache.get(req.originalUrl));
  } else {
    // Max and default 10 suggestions
    let limit = req.query.limit || 10;
    limit = limit > 10 ? 10 : limit;

    const q = req.query.q || '';
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
  getSuggestions
};
