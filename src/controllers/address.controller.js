const ldapUtil = require('../utils/ldap.util');
const addressService = require('../services/address.service');

async function get (req, res) {
  const q = req.query.q || '';
  if (q.length < 2) {
    return res.json([]);
  }

  try {
    let ldapResults = [];
    if (/^[0-9]{6}$/.test(q)) {
      ldapResults = await addressService.getPersonBySciper(q);
    } else if (/^\+?[0-9 ]+$/.test(q)) {
      ldapResults = await addressService.getPersonByPhone(q);
    } else if (/^[^@]+@[^@]+$/.test(q)) {
      ldapResults = await addressService.getPersonByEmail(q);
    } else {
      ldapResults = await addressService.getPersonByName(q);
    }
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
