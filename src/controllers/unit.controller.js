const appCache = require('../services/cache.service');
const unitService = require('../services/unit.service');

async function get (req, res) {
  try {
    const isInternal = res.locals.internal;
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
    const isInternal = res.locals.internal;
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
      let suggestions = await unitService.getSuggestions(q);
      suggestions = suggestions.slice(0, limit);
      appCache.set(req.originalUrl, [q, suggestions]);
      return res.json([q, suggestions]);
    } catch (err) {
      console.error('[error] ', err);
      return res.status(400).json({
        success: false,
        error: 'Oops, something went wrong'
      });
    }
  }
}

module.exports = {
  get,
  getCsv,
  getSuggestions
};
