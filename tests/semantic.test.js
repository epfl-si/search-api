const request = require('supertest');

const app = require('../src/app');
const semanticService = require('../src/services/semantic.service');

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

  test('It should get Semantic Sarch results', async () => {
    const searchResult = require('./resources/semantic/math.json');
    const mockSemanticService = jest.spyOn(semanticService, 'post');
    mockSemanticService.mockResolvedValue({ data: searchResult });

    const response = await request(app).get('/api/graphsearch?q=epfl');
    expect(mockSemanticService).toHaveBeenCalled();
    expect(response.statusCode).toBe(200);
    expect(response.text).toMatch('developing a mathematical model');
  });
});
