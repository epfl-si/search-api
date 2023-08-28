const ldapUtil = require('../utils/ldap.util');
const addressService = require('../services/people.service');

async function get (req, res) {
  const q = req.query.q || '';
  if (q.length < 2) {
    return res.json([]);
  }

  try {
    let ldapResults = [];
    ldapResults = await addressService.getPersonBySciper(q);
    return res.json(ldapUtil.ldapAddress2api(ldapResults, q));
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