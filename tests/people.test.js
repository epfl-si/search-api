const request = require('supertest');

const app = require('../src/app');

describe('Test API People ("/api/ldap")', () => {
  test('It should get an empty result without query', async () => {
    const response = await request(app).get('/api/ldap');
    expect(response.statusCode).toBe(200);
    expect(response.text).toMatch('[]');
  });

  test('It should get an empty result with a small query', async () => {
    const response = await request(app).get('/api/ldap?q=w');
    expect(response.statusCode).toBe(200);
    expect(response.text).toMatch('[]');
  });

  test('It should find sciper 670001', async () => {
    const jsonResult = require('./resources/people/json-sciper-670001.json');
    const response = await request(app).get('/api/ldap?q=670001');
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.text)).toMatchObject(jsonResult);
  });
});
