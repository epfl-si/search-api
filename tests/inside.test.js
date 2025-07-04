const request = require('supertest');

const authMiddleware = require('../src/middlewares/auth.middleware');
const insideService = require('../src/services/inside.service');

describe('Test Inside ("/api/inside")', () => {
  let testOutput = [];
  const originalConsoleError = console.error;
  const testConsoleError = (output) => { testOutput.push(output); };

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = testConsoleError;
    testOutput = [];
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  test('It should return an error without login', async () => {
    const mockauthMiddleware = jest.spyOn(authMiddleware, 'setUserInfo');
    mockauthMiddleware.mockImplementation((req, res, next) => {
      res.locals.authenticated = false;
      next();
    });

    const app = require('../src/app');
    const response = await request(app).get('/api/inside');
    expect(response.statusCode).toBe(401);
    expect(response.text).toMatch('{"success":false}');
  });

  test('It should return an error without VPN', async () => {
    const mockauthMiddleware = jest.spyOn(authMiddleware, 'setUserInfo');
    mockauthMiddleware.mockImplementation((req, res, next) => {
      res.locals.authenticated = true;
      next();
    });

    const app = require('../src/app');
    const response = await request(app).get('/api/inside');
    expect(mockauthMiddleware).toHaveBeenCalled();
    expect(response.statusCode).toBe(403);
    expect(response.text).toMatch('{"success":false}');
  });

  test('It should get Inside Search results', async () => {
    const searchResult = require('./resources/inside/math.json');
    const mockInsideService = jest.spyOn(insideService, 'get');
    mockInsideService.mockResolvedValueOnce({ data: searchResult });

    const mockauthMiddleware = jest.spyOn(authMiddleware, 'setUserInfo');
    mockauthMiddleware.mockImplementation((req, res, next) => {
      res.locals.authenticated = true;
      res.locals.internal = true;
      next();
    });

    const app = require('../src/app');
    const response = await request(app).get('/api/inside');
    expect(mockInsideService).toHaveBeenCalled();
    expect(mockauthMiddleware).toHaveBeenCalled();
    expect(response.statusCode).toBe(200);
    expect(response.text).toMatch('Math 8');
  });

  test('It should get an error without url', async () => {
    const mockauthMiddleware = jest.spyOn(authMiddleware, 'setUserInfo');
    mockauthMiddleware.mockImplementation((req, res, next) => {
      res.locals.authenticated = true;
      res.locals.internal = true;
      next();
    });

    const app = require('../src/app');
    const response = await request(app).get('/api/inside');
    expect(mockauthMiddleware).toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
    expect(response.text).toMatch('Oops, something went wrong');
    expect(testOutput.length).toBe(1);
    expect(testOutput[0]).toMatch('error');
  });
});
