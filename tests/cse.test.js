const request = require('supertest');

const app = require('../src/app');
const cseService = require('../src/services/cse.service');

describe('Test API CSE ("/api/cse")', () => {
  let testOutput = [];
  const originalConsoleError = console.error;
  const testConsoleError = (output) => { testOutput.push(output); };

  beforeEach(() => {
    jest.resetModules();
    console.error = testConsoleError;
    testOutput = [];
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  test('It should response the GET method', async () => {
    const response = await request(app).get('/api/cse');
    expect(response.statusCode).toBe(400);
    expect(response.text).toMatch('Request contains an invalid argument.');
    expect(testOutput.length).toBe(1);
    expect(testOutput[0]).toMatch('error');
  });

  test('It should response the GET method', async () => {
    const data = require('./resources/cse/epfl.json');
    cseService.get = jest.fn().mockReturnValue(data);

    const response = await request(app).get('/api/cse?q=epfl');
    expect(response.statusCode).toBe(200);
    // console.log(response);
  });
});
