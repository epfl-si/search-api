const request = require('supertest');

const app = require('../src/app');

describe('Test Auth ("/auth")', () => {
  test('It should get Auth status', async () => {
    const response = await request(app).get('/auth/check');
    expect(response.statusCode).toBe(200);
    expect(response.text).toMatch('{"login":false,"internal":false}');
  });
});
