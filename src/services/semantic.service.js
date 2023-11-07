const axios = require('axios');

async function get (query) {
  return axios.get('https://graphsearch.epfl.ch/api/search/search.epfl.ch', {
    params: {
      q: query.q,
      offset: query.offset || 0,
      types: query.doctype || 'any'
    }
  });
}

module.exports = {
  get
};
