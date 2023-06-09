const request = require('supertest');
const app = require('../src/app');

describe('Test root ("/")', () => {
  test('It should response the GET method', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(404);
    expect(response.text).toMatch('Oops! That page can\'t be found.');
  });
});
