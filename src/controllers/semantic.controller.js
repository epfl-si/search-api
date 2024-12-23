const appCache = require('../services/cache.service');
const semanticService = require('../services/semantic.service');

async function get (req, res) {
  if (appCache.has(req.originalUrl)) {
    return res.send(appCache.get(req.originalUrl));
  } else {
    try {
      const results = await semanticService.get(req.query);
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

async function getv2 (req, res) {
  if (appCache.has(req.originalUrl)) {
    return res.send(appCache.get(req.originalUrl));
  } else {
    try {
      const results = await semanticService.getv2(req.query);
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
  get,
  getv2
};
