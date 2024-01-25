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

  test('It should get an empty result without query', async () => {
    const response = await request(app).get('/api/ldap/suggestions');
    expect(response.statusCode).toBe(200);
    expect(response.text).toMatch('["",[]]');
  });

  test('It should get an empty result with a small query', async () => {
    const response = await request(app).get('/api/ldap?q=w');
    expect(response.statusCode).toBe(200);
    expect(response.text).toMatch('[]');
  });

  test('It should get an empty result with a small query', async () => {
    const response = await request(app).get('/api/ldap/suggestions?q=w');
    expect(response.statusCode).toBe(200);
    expect(response.text).toMatch('["w",[]]');
  });

  test('It should find sciper 670001 (fr)', async () => {
    const jsonResult = require('./resources/people/json-sciper-670001-fr.json');
    const response = await request(app).get('/api/ldap?q=670001&hl=fr');
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.text)).toStrictEqual(jsonResult);
  });

  test('It should find sciper 670001 (en)', async () => {
    const jsonResult = require('./resources/people/json-sciper-670001-en.json');
    const response = await request(app).get('/api/ldap?q=670001&hl=en');
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.text)).toStrictEqual(jsonResult);
  });

  test('It should find mail boba.fett@epfl.ch', async () => {
    const jsonResult = require('./resources/people/json-sciper-670001-fr.json');
    const response = await request(app).get('/api/ldap?q=boba.fett@epfl.ch');
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.text)).toStrictEqual(jsonResult);
  });

  test('It should find phone number 321', async () => {
    const jsonResult = require('./resources/people/json-phone-321.json');
    const response = await request(app).get('/api/ldap?q=321');
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.text)).toStrictEqual(jsonResult);
  });

  test('It should find name Fett', async () => {
    const jsonResult = require('./resources/people/json-name-fett-fr.json');
    const response = await request(app).get('/api/ldap?q=Fett');
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.text)).toStrictEqual(jsonResult);
  });

  test('It should find name Fett', async () => {
    const jsonResult = ['Fett', ['Boba Fett', 'Jango Fett']];
    const response = await request(app).get('/api/ldap/suggestions?q=Fett');
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.text)).toStrictEqual(jsonResult);
  });

  test('It should find firstname Din', async () => {
    const jsonResult = require('./resources/people/json-name-din-en.json');
    const response = await request(app).get('/api/ldap?q=Din&hl=en');
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.text)).toStrictEqual(jsonResult);
  });

  test('It should find name Fet (prefix)', async () => {
    const jsonResult = require('./resources/people/json-name-fett-fr.json');
    const response = await request(app).get('/api/ldap?q=Fet');
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.text)).toStrictEqual(jsonResult);
  });

  test('It should find name ett (suffix)', async () => {
    const jsonResult = require('./resources/people/json-name-fett-fr.json');
    const response = await request(app).get('/api/ldap?q=ett');
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.text)).toStrictEqual(jsonResult);
  });

  test('It should find Fett Boba', async () => {
    const jsonResult = require('./resources/people/json-sciper-670001-en.json');
    const response = await request(app).get('/api/ldap?q=Fett Boba&hl=en');
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.text)).toStrictEqual(jsonResult);
  });

  test('It should find Bo Katan Kryze', async () => {
    const jsonResult = require('./resources/people/json-name-kryze-fr.json');
    const response = await request(app).get('/api/ldap?q=Bo Katan Kryze');
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.text)).toStrictEqual(jsonResult);
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

  test('It should not find Kryze without ldap server', async () => {
    const mockLdapService = jest.spyOn(ldapService, 'searchAll');
    mockLdapService.mockRejectedValue(new Error('LDAP is Gone'));

    const response = await request(app).get('/api/ldap/suggestions?q=kryze');
    expect(mockLdapService).toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
    expect(response.text).toMatch('Oops, something went wrong');
    expect(testOutput.length).toBe(1);
    expect(testOutput[0]).toMatch('error');
  });
});
