const axios = require('axios');

async function post (params) {
  return axios.post('https://graphsearch.epfl.ch/api/top-suggestions', {
    terms: params.q,
    output: 'abbr',
    types: params.doctype || 'any'
  });
}

module.exports = {
  post
};
