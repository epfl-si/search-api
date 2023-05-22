const appCache = require('../services/cache.service');
const cseService = require('../services/cse.service');

async function get (req, res) {
  if (appCache.has(req.originalUrl)) {
    return res.send(appCache.get(req.originalUrl));
  } else {
    try {
      const results = await cseService.get(req.query);
      appCache.set(req.originalUrl, results.data);
      return res.json(results.data);
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
