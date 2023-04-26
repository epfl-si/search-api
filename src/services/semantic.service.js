const axios = require('axios');

async function post (params) {
  return axios.post('https://graphsearch.epfl.ch/api/suggestions-by-type', {
    terms: params.q,
    output: 'abbr',
    types: params.doctype || 'any'
  });
}

module.exports = {
  post
};
