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
    } else if (/^[^@]+@[^@]+$/.test(q)) {
      ldapResults = await peopleService.getPersonByEmail(q);
    }
    return res.json(ldapUtil.ldap2api(ldapResults));
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
