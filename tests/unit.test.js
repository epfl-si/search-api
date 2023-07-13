const request = require('supertest');
const app = require('../src/app');
const mysql = require('mysql2/promise');

jest.mock('mysql2/promise', () => {
  const mockPool = {
    getConnection: jest.fn()
  };

  return {
    createPool: jest.fn(() => mockPool),
    mockPool // Exporting the mock pool for reference
  };
});

describe('Test API Unit ("/api/unit")', () => {
  let testOutput = [];
  const originalConsoleError = console.error;
  const testConsoleError = (output) => {
    testOutput.push(output);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = testConsoleError;
    testOutput = [];
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  test('It should return nothing', async () => {
    const mockConnection = {
      query: jest.fn().mockResolvedValue([[]]),
      release: jest.fn()
    };
    mysql.createPool().getConnection.mockResolvedValue(mockConnection);

    let response = await request(app).get('/api/unit?q=drebin&hl=fr');
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.text)).toStrictEqual([]);

    response = await request(app).get('/api/unit?acro=mandalo&hl=fr');
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('');
  });

  test('It should return a unit list', async () => {
    const mockConnection = {
      query: jest.fn().mockImplementation((query, values) => {
        const jsonData = require('./resources/cadidb/searchUnits-in.json');
        return Promise.resolve([jsonData]);
      }),
      release: jest.fn()
    };
    mysql.createPool().getConnection.mockResolvedValue(mockConnection);

    let jsonResult = require('./resources/unit/unit-list-in-en.json');
    let response = await request(app).get('/api/unit?q=in&hl=en');
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.text)).toStrictEqual(jsonResult);

    jsonResult = require('./resources/unit/unit-list-in-fr.json');
    response = await request(app).get('/api/unit?q=in&hl=fr');
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.text)).toStrictEqual(jsonResult);

    jsonResult = require('./resources/unit/unit-list-in-fr.json');
    response = await request(app).get('/api/unit?q=in');
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.text)).toStrictEqual(jsonResult);
  });

  test('It should return a unit with people', async () => {
    const mockConnection = {
      query: jest.fn().mockImplementation((query, values, referrer) => {
        let jsonData;
        switch (referrer) {
          case 'searchUnits':
            jsonData = require('./resources/cadidb/searchUnits-mandalore.json');
            break;
          case 'getUnit':
            jsonData = require('./resources/cadidb/getUnit-mandalore.json');
            break;
          case 'getUnitPath':
            jsonData = require('./resources/cadidb/getUnitPath-mandalore.json');
        }
        return Promise.resolve([jsonData]);
      }),
      release: jest.fn()
    };
    mysql.createPool().getConnection.mockResolvedValue(mockConnection);

    let jsonResult = require('./resources/unit/unit-mandalore-en.json');
    let response = await request(app).get('/api/unit?q=mandalore&hl=en');
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.text)).toStrictEqual(jsonResult);

    jsonResult = require('./resources/unit/unit-mandalore-fr.json');
    response = await request(app).get('/api/unit?q=mandalore&hl=fr');
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.text)).toStrictEqual(jsonResult);

    jsonResult = require('./resources/unit/unit-mandalore-fr.json');
    response = await request(app).get('/api/unit?acro=mandalore&hl=fr');
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.text)).toStrictEqual(jsonResult);
  });

  test('It should return a unit with subunits', async () => {
    const mockConnection = {
      query: jest.fn().mockImplementation((query, values, referrer) => {
        let jsonData;
        switch (referrer) {
          case 'searchUnits':
            jsonData = require('./resources/cadidb/searchUnits-ot.json');
            break;
          case 'getUnit':
            jsonData = require('./resources/cadidb/getUnit-ot.json');
            break;
          case 'getUnitPath':
            jsonData = require('./resources/cadidb/getUnitPath-ot.json');
            break;
          case 'getSubunits':
            jsonData = require('./resources/cadidb/getSubunits-ot.json');
        }
        return Promise.resolve([jsonData]);
      }),
      release: jest.fn()
    };
    mysql.createPool().getConnection.mockResolvedValue(mockConnection);

    let jsonResult = require('./resources/unit/unit-ot-en.json');
    let response = await request(app).get('/api/unit?q=ot&hl=en');
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.text)).toStrictEqual(jsonResult);

    jsonResult = require('./resources/unit/unit-ot-fr.json');
    response = await request(app).get('/api/unit?q=ot&hl=fr');
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.text)).toStrictEqual(jsonResult);
  });

  test('It should return an error with a status code 400', async () => {
    const mockConnection = {
      query: jest.fn().mockRejectedValue(),
      release: jest.fn()
    };
    mysql.createPool().getConnection.mockResolvedValue(mockConnection);

    const response = await request(app).get('/api/unit?q=xxx&hl=en');
    expect(response.statusCode).toBe(400);
    expect(response.text).toMatch('Oops, something went wrong');
    expect(testOutput.length).toBe(1);
    expect(testOutput[0]).toMatch('error');
  });
});
