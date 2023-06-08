const peopleService = require('../services/people.service');

async function get (req, res) {
  if (!('q' in req.query)) {
    const queryErr = 'Query is missing';
    console.error('[error] ', queryErr);
    return res.status(400).json({ success: false, error: queryErr });
  }

  const q = req.query.q;
  if (q.length < 2) {
    return res.json([]);
  }

  try {
    const results = await peopleService.getPersonBySciper(q);
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
