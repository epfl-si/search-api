const cseConfig = require('../configs/cse.config');
const { google } = require('googleapis');
const customsearch = google.customsearch('v1');

async function get (req, res, next) {
  const { q, start, hl } = req.query;
  const results = await customsearch.cse.list({
    cx: cseConfig.cx,
    auth: cseConfig.key,
    q,
    start,
    hl
  });
  return res.json(results.data);
}

module.exports = {
  get
};
