const axios = require('axios');

const insideConfig = require('../configs/inside.config');

const elasticClient = axios.create({
  baseURL: insideConfig.baseUrl,
  timeout: 10000,
  auth: {
    username: insideConfig.username,
    password: insideConfig.password
  }
});

const elasticSearchParams = {
  query: {
    simple_query_string: {
      default_operator: 'and',
      fields: [
        'title',
        'description',
        'url',
        'attachment.title',
        'attachment.content'
      ]
    }
  },
  size: 10,
  highlight: {
    fragment_size: 200,
    pre_tags: '<b>',
    post_tags: '</b>',
    fields: {
      description: {},
      'attachment.content': {}
    }
  }
};

async function get (q = '', from = 0) {
  elasticSearchParams.query.simple_query_string.query = q;
  elasticSearchParams.from = from;

  return elasticClient.get('/inside/_search', {
    params: {
      source: JSON.stringify(elasticSearchParams),
      source_content_type: 'application/json'
    }
  });
}

module.exports = {
  get
};
