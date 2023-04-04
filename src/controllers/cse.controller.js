const cseService = require('../services/cse.service');

async function get (req, res) {
  try {
    const results = await cseService.get(req.query);
    return res.json(results.data);
  } catch (err) {
    console.error(
      '[error] Request contains an invalid argument.', err.message
    );
    return res.status(400).json({
      success: false,
      error: 'Request contains an invalid argument.'
    });
  }
}

module.exports = {
  get
};
