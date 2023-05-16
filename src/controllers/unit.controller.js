const unitService = require('../services/unit.service');

async function get (req, res) {
  try {
    const results = await unitService.get(req.query);
    console.log(results.data);
    return res.json(results);
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
