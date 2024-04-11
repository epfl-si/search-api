const ldapUtil = require('../utils/ldap.util');
const appCache = require('../services/cache.service');
const peopleService = require('../services/people.service');

async function buildHashUnit () {
  const unitHash = {};
  const units = await peopleService.getUnits();
  for (const unit of units) {
    unitHash[unit.sigle] = unit.id_unite;
  }
  return unitHash;
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
      ldapResults = await peopleService.getPersonByName(q);
    }
    const apiResults = ldapUtil.ldap2api(ldapResults, q, req.query.hl);
    const unitHash = await buildHashUnit();

    // Add code
    for (const person of apiResults) {
      for (const accred of person.accreds) {
        const code = unitHash[accred.acronym];
        accred.code = code;
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
