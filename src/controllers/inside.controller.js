const insideService = require('../services/inside.service');

async function get (req, res) {
  if (!res.locals.authenticated) {
    return res.status(401).json({ success: false });
  }

  if (!res.locals.internal) {
    return res.status(403).json({ success: false });
  }

  try {
    const results = await insideService.get(req.query.q, req.query.from);
    return res.json(results.data);
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
