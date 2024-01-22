const appCache = require('../services/cache.service');
const unitService = require('../services/unit.service');

async function get (req, res) {
  try {
    const isInternal = req.header('X-EPFL-Internal') === 'TRUE';
    const cacheKey = req.originalUrl + '-' + (isInternal ? 'int' : 'ext');
    if (appCache.has(cacheKey)) {
      return res.send(appCache.get(cacheKey));
    } else {
      const results = await unitService.get(req.query, isInternal);
      appCache.set(cacheKey, results);
      return res.json(results);
    }
  } catch (err) {
    console.error('[error] ', err);
    return res.status(400).json({
      success: false,
      error: 'Oops, something went wrong'
    });
  }
}

async function getCsv (req, res) {
  try {
    const isInternal = req.header('X-EPFL-Internal') === 'TRUE';
    const lang = req.query.hl || 'fr';
    const acro = req.query.q;
    if (!isInternal) {
      return res.status(403)
        .send('CSV export is only allowed via EPFL intranet or VPN');
    } else if (!acro) {
      return res.status(400)
        .send('Missing required query parameter: q');
    }
    const csvData = await unitService.getCsv(acro, lang);
    if (!csvData) {
      return res.sendStatus(404);
    }
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=extract.csv');
    return res.send(csvData);
  } catch (err) {
    console.error('[error] ', err);
    return res.status(400).json({
      success: false,
      error: 'Oops, something went wrong'
    });
  }
}

module.exports = {
  get,
  getCsv
};
