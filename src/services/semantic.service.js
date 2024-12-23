const axios = require('axios');

async function get (query) {
  let limit = query.limit || 10;
  limit = limit > 100 ? 100 : limit;

  return axios.get('https://graphsearch.epfl.ch/api/search/search.epfl.ch', {
    params: {
      q: query.q,
      limit,
      types: query.doctype || 'any'
    }
  });
}

async function getv2 (query) {
  let limit = query.limit || 10;
  limit = limit > 100 ? 100 : limit;

  return axios.get('https://graphsearch.epfl.ch/api/v2/search/search.epfl.ch', {
    params: {
      q: query.q,
      limit,
      types: query.doctype || 'any'
    }
  });
}

module.exports = {
  get,
  getv2
};
