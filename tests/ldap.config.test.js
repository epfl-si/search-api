describe('Test LDAP Config requirements', () => {
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

  test('It should exit without SEARCH_API_LDAP_URL', () => {
    const ldapURL = process.env.SEARCH_API_LDAP_URL;
    delete process.env.SEARCH_API_LDAP_URL;

    const mockExit = jest.spyOn(process, 'exit').mockImplementation((num) => {
      throw new Error('process.exit: ' + num);
    });
    expect(() => {
      require('../src/configs/ldap.config');
    }).toThrow();
    expect(mockExit).toHaveBeenCalledWith(1);
    expect(testOutput.length).toBe(1);
    expect(testOutput[0]).toMatch('error');
    mockExit.mockRestore();

    process.env.SEARCH_API_LDAP_URL = ldapURL;
  });

  test('It should have correct config', () => {
    const ldapConfig = require('../src/configs/ldap.config');
    expect(ldapConfig.url).toBe('ldap://0.0.0.0:1389');
  });
});
