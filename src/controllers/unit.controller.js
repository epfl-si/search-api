const unitService = require('../services/unit.service');

async function get (req, res) {
  try {
    const isInternal = req.header('X-EPFL-Internal') === 'TRUE';
    const results = await unitService.get(req.query, isInternal);
    return res.json(results);
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
    if (!isInternal) {
      return res.sendStatus(403);
    }
    const csvData = await unitService.getCsv(req.query);
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
