const unitService = require('../services/unit.service');

async function get (req, res) {
  try {
    const results = await unitService.get(req.query);
    return res.json(results);
  } catch (err) {
    console.error('[error] ', err);
    return res.status(400).json({
      success: false,
      error: 'Oops, something went wrong'
    });
  }
}

module.exports = {
  get
};
