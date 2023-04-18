const cseConfig = require('../configs/cse.config');
const { google } = require('googleapis');
const customsearch = google.customsearch('v1');

async function get (params) {
  return customsearch.cse.list({
    cx: cseConfig.cx,
    auth: cseConfig.apiKey,
    q: params.q,
    start: params.start,
    hl: params.hl,
    siteSearch: params.siteSearch,
    searchType: params.searchType
  });
}

module.exports = {
  get
};
