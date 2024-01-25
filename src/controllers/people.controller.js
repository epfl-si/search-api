const ldapUtil = require('../utils/ldap.util');
const peopleService = require('../services/people.service');

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
    return res.json(ldapUtil.ldap2api(ldapResults, q, req.query.hl));
  } catch (err) {
    console.error('[error] ', err.message);
    return res.status(400).json({
      success: false,
      error: 'Oops, something went wrong'
    });
  }
}

async function getSuggestions (req, res) {
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
    return res.json([q, suggestions]);
  } catch (err) {
    console.error('[error] ', err.message);
    return res.status(400).json({
      success: false,
      error: 'Oops, something went wrong'
    });
  }
}

module.exports = {
  get,
  getSuggestions
};
