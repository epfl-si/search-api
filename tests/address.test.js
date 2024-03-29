const request = require('supertest');

const app = require('../src/app');
const ldapService = require('../src/services/ldap.service');

describe('Test API People ("/api/address")', () => {
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

  test('It should get an empty result without query', async () => {
    const response = await request(app).get('/api/address');
    expect(response.statusCode).toBe(200);
    expect(response.text).toMatch('{}');
  });

  test('It should get an empty result with a small query', async () => {
    const response = await request(app).get('/api/address?q=w');
    expect(response.statusCode).toBe(200);
    expect(response.text).toMatch('{}');
  });

  test('It should find sciper 670001', async () => {
    const jsonResult = require('./resources/address/json-sciper-670001.json');
    const response = await request(app).get('/api/address?q=670001');
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.text)).toStrictEqual(jsonResult);
  });

  test('It should find sciper 670001 (cache)', async () => {
    const jsonResult = require('./resources/address/json-sciper-670001.json');
    const response = await request(app).get('/api/address?q=670001');
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.text)).toStrictEqual(jsonResult);
  });

  test('It should not find sciper 679999 without ldap server', async () => {
    const mockLdapService = jest.spyOn(ldapService, 'searchAll');
    mockLdapService.mockRejectedValue(new Error('LDAP is Gone'));

    const response = await request(app).get('/api/address?q=679999');
    expect(mockLdapService).toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
    expect(response.text).toMatch('Oops, something went wrong');
    expect(testOutput.length).toBe(1);
    expect(testOutput[0]).toMatch('error');
  });
});
