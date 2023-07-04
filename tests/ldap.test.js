const ldap = require('ldapjs');
const EventEmitter = require('events');

describe('Test LDAP Service', () => {
  let testOutput = [];
  const originalConsoleError = console.error;
  const testConsoleError = (output) => { testOutput.push(output); };

  const mockSearchFn = jest.fn(
    (client, dn, opts, searchCallbackFn) => searchCallbackFn()
  );

  jest.spyOn(ldap, 'createClient').mockReturnValue({
    url: {
      host: process.env.SEARCH_API_LDAP_URL,
      timeout: 50,
      connectTimeout: 30
    },
    search: mockSearchFn
  });

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = testConsoleError;
    testOutput = [];
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  test('It should return an error on bad search request', async () => {
    const emitter = new EventEmitter();
    mockSearchFn.mockImplementationOnce(
      (dn, opts, searchCallbackFn) => searchCallbackFn(false, emitter)
    );

    setTimeout(() => {
      emitter.emit('error', new Error('Bad search request'));
    }, 40);

    const ldapService = require('../src/services/ldap.service');

    expect.assertions(2);
    try {
      await ldapService.searchAll(
        '',
        { filter: '&(objectClass=Person)', scope: 'sub' }
      );
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toEqual('Bad search request');
    }
  });

  test('It should return an error on timeout search request', async () => {
    const emitter = new EventEmitter();
    mockSearchFn.mockImplementationOnce(
      (dn, opts, searchCallbackFn) => searchCallbackFn(false, emitter)
    );

    setTimeout(() => {
      emitter.emit('timeout', new Error('Timeout search request'));
    }, 40);

    const ldapService = require('../src/services/ldap.service');

    expect.assertions(2);
    try {
      await ldapService.searchAll(
        '',
        { filter: '&(objectClass=Person)', scope: 'sub' }
      );
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toEqual('Timeout search request');
    }
  });
});
