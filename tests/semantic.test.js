const axios = require('axios');
const request = require('supertest');

const app = require('../src/app');

jest.mock('axios');

describe('Test API Semantic Sarch ("/api/graphsearch")', () => {
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

  test('It should get an error without argument', async () => {
    const response = await request(app).get('/api/graphsearch');
    expect(response.statusCode).toBe(400);
    expect(response.text).toMatch('Oops, something went wrong');
    expect(testOutput.length).toBe(1);
    expect(testOutput[0]).toMatch('error');
  });

  test('It should get an error without argument', async () => {
    const response = await request(app).get('/api/graphsearch/v2');
    expect(response.statusCode).toBe(400);
    expect(response.text).toMatch('Oops, something went wrong');
    expect(testOutput.length).toBe(1);
    expect(testOutput[0]).toMatch('error');
  });

  test('It should get Semantic Search results with default limit', async () => {
    const searchResult = require('./resources/semantic/math.json');
    axios.get.mockResolvedValueOnce({ data: searchResult });

    const response = await request(app).get('/api/graphsearch?q=math');
    expect(axios.get).toHaveBeenCalled();
    expect(response.statusCode).toBe(200);
    expect(response.text).toMatch('alternatively spelled optimisation');
    const results = JSON.parse(response.text);
    expect(results.result_count).toBe(10);
  });

  test('It should get Semantic Search results with default limit', async () => {
    const searchResult = require('./resources/semantic/math-v2.json');
    axios.get.mockResolvedValueOnce({ data: searchResult });

    const response = await request(app).get('/api/graphsearch/v2?q=math');
    expect(axios.get).toHaveBeenCalled();
    expect(response.statusCode).toBe(200);
    expect(response.text).toMatch('mathematical model for a collection');
    const results = JSON.parse(response.text);
    expect(results.result_count).toBe(10);
  });

  test('It should get Semantic Search results with large limit', async () => {
    const searchResult = require('./resources/semantic/ph.json');
    axios.get.mockResolvedValueOnce({ data: searchResult });

    const response = await request(app).get('/api/graphsearch?q=ph&limit=1000');
    expect(axios.get).toHaveBeenCalled();
    expect(response.statusCode).toBe(200);
    expect(response.text).toMatch('In chemistry, thermodynamics');
    const results = JSON.parse(response.text);
    expect(results.result_count).toBe(100);
  });

  test('It should get Semantic Search results with large limit', async () => {
    const searchResult = require('./resources/semantic/ph-v2.json');
    axios.get.mockResolvedValueOnce({ data: searchResult });

    const response = await request(app).get(
      '/api/graphsearch/v2?q=ph&limit=1000'
    );
    expect(axios.get).toHaveBeenCalled();
    expect(response.statusCode).toBe(200);
    expect(response.text).toMatch('natural science of matter');
    const results = JSON.parse(response.text);
    expect(results.result_count).toBe(1000);
  });

  test('It should get Semantic Search results from cache', async () => {
    const searchResult = require('./resources/semantic/math.json');
    axios.get.mockResolvedValueOnce({ data: searchResult });

    const response = await request(app).get('/api/graphsearch?q=math');
    expect(axios.get).toHaveBeenCalled();
    expect(response.statusCode).toBe(200);
    expect(response.text).toMatch(
      'discrete optimization and continuous optimization'
    );
  });

  test('It should get Semantic Search results from cache', async () => {
    const searchResult = require('./resources/semantic/math-v2.json');
    axios.get.mockResolvedValueOnce({ data: searchResult });

    const response = await request(app).get('/api/graphsearch/v2?q=math');
    expect(axios.get).toHaveBeenCalled();
    expect(response.statusCode).toBe(200);
    expect(response.text).toMatch(
      'a set with a single element is a singleton'
    );
  });
});
