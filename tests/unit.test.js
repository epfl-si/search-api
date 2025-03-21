const request = require('supertest');
const app = require('../src/app');
const mysql = require('mysql2/promise');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

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

    let jsonResult = require('./resources/unit/unit-nevarro-fr.json');
    let response = await request(app).get('/api/unit?q=nevarro&hl=fr');
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.text)).toStrictEqual(jsonResult);

    jsonResult = require('./resources/unit/unit-nevarro-fr.json');
    response = await request(app).get('/api/unit?q=11302&hl=fr');
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
    const response = await request(app)
      .get('/api/unit?acro=kalevala&hl=fr')
      .set({ 'X-EPFL-Internal': 'TRUE' });
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.text)).toStrictEqual(jsonResult);
  });

  test('It should find Concordia (where COSEC doesnt exists)', async () => {
    const mockConnection = {
      query: jest.fn().mockImplementation((query, values, referrer) => {
        let jsonData;
        switch (referrer) {
          case 'getUnit':
            jsonData = require('./resources/cadidb/getUnit-concordia.json');
            break;
          case 'getUnitPath':
            jsonData = require('./resources/cadidb/getUnitPath-concordia.json');
        }
        return Promise.resolve([jsonData]);
      }),
      release: jest.fn()
    };
    mysql.createPool().getConnection.mockResolvedValue(mockConnection);

    const mockApimdResponse = require('./resources/apimd/unit-concordia.json');
    axios.get.mockResolvedValue({ data: mockApimdResponse });

    const jsonResult = require('./resources/unit/unit-concordia.json');
    const response = await request(app)
      .get('/api/unit?acro=concordia')
      .set({ 'X-EPFL-Internal': 'TRUE' });
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

  test('It should find OT unit (with subunits) from cache', async () => {
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

  test('(csv) It should return 404 (unit TV-2 has no accreds)', async () => {
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
    const response = await request(app)
      .get('/api/unit/csv?q=tv-2&hl=fr')
      .set({ 'X-EPFL-Internal': 'TRUE' });
    expect(response.statusCode).toBe(404);
  });

  test('(csv) It should return 403 (query from external)', async () => {
    const response = await request(app)
      .get('/api/unit/csv?q=mandalore&hl=fr')
      .set({ 'X-EPFL-Internal': 'FALSE' });
    expect(response.statusCode).toBe(403);
  });

  test('(csv) It should return 400 (missing query parameter: q)', async () => {
    const response = await request(app)
      .get('/api/unit/csv?hl=fr')
      .set({ 'X-EPFL-Internal': 'TRUE' });
    expect(response.statusCode).toBe(400);
  });

  test('(csv) It should return the csv export file of Mandalore)', async () => {
    const mockConnection = {
      query: jest.fn().mockImplementation((query, values, referrer) => {
        let jsonData;
        switch (referrer) {
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

    let expectedCsv = fs.readFileSync(
      path.resolve(__dirname,
        './resources/unit/csv-unit-mandalore-en.csv'), 'utf-8');
    let response = await request(app)
      .get('/api/unit/csv?q=mandalore&hl=en')
      .set({ 'X-EPFL-Internal': 'TRUE' });
    expect(response.statusCode).toBe(200);
    expect(response.text).toEqual(expectedCsv);

    expectedCsv = fs.readFileSync(
      path.resolve(__dirname,
        './resources/unit/csv-unit-mandalore-fr.csv'), 'utf-8');
    response = await request(app)
      .get('/api/unit/csv?q=mandalore&hl=fr')
      .set({ 'X-EPFL-Internal': 'TRUE' });
    expect(response.statusCode).toBe(200);
    expect(response.text).toEqual(expectedCsv);
  });

  test('(csv) It should return the csv export file of Kalevala)', async () => {
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

    const expectedCsv = fs.readFileSync(
      path.resolve(__dirname,
        './resources/unit/csv-unit-kalevala-fr.csv'), 'utf-8');
    const response = await request(app)
      .get('/api/unit/csv?q=kalevala')
      .set({ 'X-EPFL-Internal': 'TRUE' });
    expect(response.statusCode).toBe(200);
    expect(response.text).toEqual(expectedCsv);
  });

  test('(csv) It should return an error with a status code 400', async () => {
    const mockConnection = {
      query: jest.fn().mockRejectedValue(),
      release: jest.fn()
    };
    mysql.createPool().getConnection.mockResolvedValue(mockConnection);

    const response = await request(app)
      .get('/api/unit/csv?q=mandalore&hl=en')
      .set({ 'X-EPFL-Internal': 'TRUE' });
    expect(response.statusCode).toBe(400);
    expect(response.text).toMatch('Oops, something went wrong');
    expect(testOutput.length).toBe(1);
    expect(testOutput[0]).toMatch('error');
  });

  test('(sug) It should get an empty result without query', async () => {
    const response = await request(app).get('/api/unit/suggestions');
    expect(response.statusCode).toBe(200);
    expect(response.text).toMatch('["",[]]');
  });

  test('(sug) It should get an empty result with a small query', async () => {
    const response = await request(app).get('/api/unit/suggestions?q=z');
    expect(response.statusCode).toBe(200);
    expect(response.text).toMatch('["z",[]]');
  });

  test('(sug) It should find units with term "in"', async () => {
    const jsonResult = ['in', ['BESPIN', 'KAMINO', 'TATOOINE', 'SO']];

    const mockApimdResponse = require('./resources/apimd/units-in.json');
    axios.get.mockResolvedValue({ data: mockApimdResponse });

    const response = await request(app).get(
      '/api/unit/suggestions?q=in&limit=20'
    );
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.text)).toStrictEqual(jsonResult);
  });

  test('(sug) It should find units with term "in" via cache', async () => {
    const jsonResult = ['in', ['BESPIN', 'KAMINO', 'TATOOINE', 'SO']];

    const mockApimdResponse = require('./resources/apimd/units-in.json');
    axios.get.mockResolvedValue({ data: mockApimdResponse });

    const response = await request(app).get(
      '/api/unit/suggestions?q=in&limit=20'
    );
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.text)).toStrictEqual(jsonResult);
  });

  test('(sug) It should find units with term "yavin"', async () => {
    const jsonResult = ['yavin', ['YAVIN', 'YAVIN4']];

    const mockApimdResponse = require('./resources/apimd/units-yavin.json');
    axios.get.mockResolvedValue({ data: mockApimdResponse });

    const response = await request(app).get(
      '/api/unit/suggestions?q=yavin&limit=5'
    );
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.text)).toStrictEqual(jsonResult);
  });

  test('(sug) It should not find units without api', async () => {
    axios.get.mockRejectedValue(new Error('API is Gone'));

    const response = await request(app).get(
      '/api/unit/suggestions?q=zzzzz'
    );
    expect(response.statusCode).toBe(400);
    expect(response.text).toMatch('Oops, something went wrong');
    expect(testOutput.length).toBe(1);
    expect(testOutput[0]).toMatch('error');
  });
});
