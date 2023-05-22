const semanticService = require('../services/semantic.service');

async function post (req, res) {
  try {
    const results = await semanticService.post(req.query);
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
  post
};
