const request = require('supertest');

function testNonEnabledRoute (envName, route) {
  test(`It should get a 404 for "${route} when non enabled"`, async () => {
    process.env[envName] = 'False';
    const app = require('../src/app');

    const response = await request(app).get(route);
    expect(response.statusCode).toBe(404);
    expect(response.text).toMatch('Oops! That page can\'t be found.');
  });
}

describe('Test 404 routes', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('It should get a 404 for "/"', async () => {
    const app = require('../src/app');

    const response = await request(app).get('/');
    expect(response.statusCode).toBe(404);
    expect(response.text).toMatch('Oops! That page can\'t be found.');
  });

  testNonEnabledRoute('SEARCH_API_ENABLE_CSE', '/api/cse');
  testNonEnabledRoute('SEARCH_API_ENABLE_LDAP', '/api/ldap');
  testNonEnabledRoute('SEARCH_API_ENABLE_UNIT', '/api/unit');
  testNonEnabledRoute('SEARCH_API_ENABLE_GRAPHSEARCH', '/api/graphsearch');
});
