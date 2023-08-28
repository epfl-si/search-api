const ldapUtil = require('../utils/ldap.util');
const addressService = require('../services/people.service');
const appCache = require('../services/cache.service');

async function get (req, res) {
  const q = req.query.q || '';
  if (q.length < 6) {
    return res.json({});
  }

  if (appCache.has(req.originalUrl)) {
    return res.send(appCache.get(req.originalUrl));
  } else {
    try {
      let ldapResults;
      if (/^[0-9]{6}$/.test(q)) {
        ldapResults = await addressService.getPersonBySciper(q);
      }
      const jsonResponse = ldapUtil.ldapAddress2api(ldapResults);
      appCache.set(req.originalUrl, jsonResponse);
      return res.json(jsonResponse);
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
  get
};
