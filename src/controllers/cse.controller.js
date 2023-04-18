const cseService = require('../services/cse.service');

async function get (req, res) {
  try {
    const results = await cseService.get(req.query);
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
