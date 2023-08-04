const axios = require('axios');

async function get (query) {
  return axios.get('https://graphdb.epfl.ch:41110/search/search.epfl.ch', {
    params: {
      q: query.q,
      types: query.doctype || 'any'
    }
  });
}

module.exports = {
  get
};
