const request = require('supertest');
const app = require('../src/app');
const mysql = require('mysql2/promise');
const axios = require('axios');

jest.mock('axios');

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

  test('It should return an error without Cadi DB connection', async () => {
    // Do not mock anything in this test.
    const response = await request(app).get('/api/unit?q=zzz');
    expect(response.statusCode).toBe(400);
    expect(response.text).toMatch('Oops, something went wrong');
    expect(testOutput.length).toBe(1);
    expect(testOutput[0]).toMatch('error');
  });

  test('It should find nothing', async () => {
    const mockConnection = {
      query: jest.fn().mockResolvedValue([[]]),
      release: jest.fn()
    };
    mysql.createPool().getConnection.mockResolvedValue(mockConnection);

    let response = await request(app).get('/api/unit?q=drebin&hl=fr');
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.text)).toStrictEqual({});

    response = await request(app).get('/api/unit?acro=xxx&hl=fr');
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.text)).toStrictEqual({});
  });

  test('It should find a unit list based on search term "in"', async () => {
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

  test('It should find a unit list based on search term "so"', async () => {
    const mockConnection = {
      query: jest.fn().mockImplementation((query, values) => {
        const jsonData = require('./resources/cadidb/searchUnits-so.json');
        return Promise.resolve([jsonData]);
      }),
      release: jest.fn()
    };
    mysql.createPool().getConnection.mockResolvedValue(mockConnection);

    const jsonResult = require('./resources/unit/unit-list-so-fr.json');
    const response = await request(app).get('/api/unit?q=so&hl=fr');
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.text)).toStrictEqual(jsonResult);
  });

  test('It should find Mandalore unit (without/with admin data)', async () => {
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

    const mockApimdResponse = require('./resources/apimd/unit-mandalore.json');
    axios.get.mockResolvedValue({ data: mockApimdResponse });

    let jsonResult =
      require('./resources/unit/unit-mandalore-en-external.json');
    let response = await request(app)
      .get('/api/unit?q=mandalore&hl=en')
      .set({ 'X-EPFL-Internal': 'FALSE' });
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.text)).toStrictEqual(jsonResult);

    jsonResult =
      require('./resources/unit/unit-mandalore-fr-internal.json');
    response = await request(app)
      .get('/api/unit?q=mandalore&hl=fr')
      .set({ 'X-EPFL-Internal': 'TRUE' });
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.text)).toStrictEqual(jsonResult);

    jsonResult =
      require('./resources/unit/unit-mandalore-fr-internal.json');
    response = await request(app)
      .get('/api/unit?acro=mandalore&hl=fr')
      .set({ 'X-EPFL-Internal': 'TRUE' });
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.text)).toStrictEqual(jsonResult);
  });

  test('It should find Nevarro unit (where there is nobody)', async () => {
    const mockConnection = {
      query: jest.fn().mockImplementation((query, values, referrer) => {
        let jsonData;
        switch (referrer) {
          case 'searchUnits':
            jsonData = require('./resources/cadidb/searchUnits-nevarro.json');
            break;
          case 'getUnit':
            jsonData = require('./resources/cadidb/getUnit-nevarro.json');
            break;
          case 'getUnitPath':
            jsonData = require('./resources/cadidb/getUnitPath-nevarro.json');
        }
        return Promise.resolve([jsonData]);
      }),
      release: jest.fn()
    };
    mysql.createPool().getConnection.mockResolvedValue(mockConnection);

    const mockApimdResponse = require('./resources/apimd/unit-nevarro.json');
    axios.get.mockResolvedValue({ data: mockApimdResponse });

    const jsonResult = require('./resources/unit/unit-nevarro-fr.json');
    const response = await request(app).get('/api/unit?q=nevarro&hl=fr');
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.text)).toStrictEqual(jsonResult);
  });

  test('It should find Kalevala unit (where head has no email)', async () => {
    const mockConnection = {
      query: jest.fn().mockImplementation((query, values, referrer) => {
        let jsonData;
        switch (referrer) {
          case 'getUnit':
            jsonData = require('./resources/cadidb/getUnit-kalevala.json');
            break;
          case 'getUnitPath':
            jsonData = require('./resources/cadidb/getUnitPath-kalevala.json');
        }
        return Promise.resolve([jsonData]);
      }),
      release: jest.fn()
    };
    mysql.createPool().getConnection.mockResolvedValue(mockConnection);

    const mockApimdResponse = require('./resources/apimd/unit-kalevala.json');
    axios.get.mockResolvedValue({ data: mockApimdResponse });

    const jsonResult = require('./resources/unit/unit-kalevala-fr.json');
    const response = await request(app).get('/api/unit?acro=kalevala&hl=fr');
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.text)).toStrictEqual(jsonResult);
  });

  test('It should find OT unit (with subunits)', async () => {
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

    let jsonResult = require('./resources/unit/unit-ot-en-external.json');
    let response = await request(app)
      .get('/api/unit?q=ot&hl=en')
      .set({ 'X-EPFL-Internal': 'FALSE' });
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.text)).toStrictEqual(jsonResult);

    jsonResult = require('./resources/unit/unit-ot-fr-internal.json');
    response = await request(app)
      .get('/api/unit?q=ot&hl=fr')
      .set({ 'X-EPFL-Internal': 'TRUE' });
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.text)).toStrictEqual(jsonResult);
  });

  test('It should find TV-2 unit (where no subunits)', async () => {
    const mockConnection = {
      query: jest.fn().mockImplementation((query, values, referrer) => {
        let jsonData;
        switch (referrer) {
          case 'getUnit':
            jsonData = require('./resources/cadidb/getUnit-tv-2.json');
            break;
          case 'getUnitPath':
            jsonData = require('./resources/cadidb/getUnitPath-tv-2.json');
            break;
          case 'getSubunits':
            jsonData = [];
        }
        return Promise.resolve([jsonData]);
      }),
      release: jest.fn()
    };
    mysql.createPool().getConnection.mockResolvedValue(mockConnection);

    const jsonResult = require('./resources/unit/unit-tv-2-fr.json');
    const response = await request(app).get('/api/unit?acro=tv-2&hl=fr');
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
