const request = require('supertest');

const app = require('../src/app');
const ldapService = require('../src/services/ldap.service');

describe('Test API People ("/api/ldap")', () => {
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
    const response = await request(app).get('/api/ldap');
    expect(response.statusCode).toBe(200);
    expect(response.text).toMatch('[]');
  });

  test('It should get an empty result with a small query', async () => {
    const response = await request(app).get('/api/ldap?q=w');
    expect(response.statusCode).toBe(200);
    expect(response.text).toMatch('[]');
  });

  test('It should find sciper 670001', async () => {
    const jsonResult = require('./resources/people/json-sciper-670001.json');
    const response = await request(app).get('/api/ldap?q=670001');
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.text)).toMatchObject(jsonResult);
  });

  test('It should find mail boba.fett@epfl.ch', async () => {
    const jsonResult = require('./resources/people/json-sciper-670001.json');
    const response = await request(app).get('/api/ldap?q=boba.fett@epfl.ch');
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.text)).toMatchObject(jsonResult);
  });

  test('It should find phone number 0321', async () => {
    const jsonResult = require('./resources/people/json-sciper-670001.json');
    const response = await request(app).get('/api/ldap?q=0321');
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.text)).toMatchObject(jsonResult);
  });

  test('It should not find name boba', async () => {
    const response = await request(app).get('/api/ldap?q=boba');
    expect(response.statusCode).toBe(200);
    expect(response.text).toMatch('[]');
  });

  test('It should not find sciper 679999 without ldap server', async () => {
    const mockLdapService = jest.spyOn(ldapService, 'searchAll');
    mockLdapService.mockRejectedValue(new Error('LDAP is Gone'));

    const response = await request(app).get('/api/ldap?q=679999');
    expect(mockLdapService).toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
    expect(response.text).toMatch('Oops, something went wrong');
    expect(testOutput.length).toBe(1);
    expect(testOutput[0]).toMatch('error');
  });
});
