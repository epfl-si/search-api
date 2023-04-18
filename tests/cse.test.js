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

  test('It should get an error without argument', async () => {
    const response = await request(app).get('/api/cse');
    expect(response.statusCode).toBe(400);
    expect(response.text).toMatch('Oops, something went wrong');
    expect(testOutput.length).toBe(1);
    expect(testOutput[0]).toMatch('error');
  });

  test('It should get CSE results', async () => {
    const searchResult = require('./resources/cse/epfl.json');
    const mockCseService = jest.spyOn(cseService, 'get');
    mockCseService.mockResolvedValue({ data: searchResult });

    const response = await request(app).get('/api/cse?q=epfl');
    expect(mockCseService).toHaveBeenCalled();
    expect(response.statusCode).toBe(200);
    expect(response.text).toMatch('EPFL is a university whose three missions');
  });
});
