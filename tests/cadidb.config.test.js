describe('Test CADI DB Config requirements', () => {
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

  function testExitWithoutKey (varName) {
    test('It should exit without ' + varName, () => {
      const oldKey = process.env[varName];
      delete process.env[varName];

      const mockExit = jest.spyOn(process, 'exit').mockImplementation((num) => {
        throw new Error('process.exit: ' + num);
      });
      expect(() => {
        require('../src/configs/cadidb.config');
      }).toThrow();
      expect(mockExit).toHaveBeenCalledWith(1);
      expect(testOutput.length).toBe(1);
      expect(testOutput[0]).toMatch('error');
      mockExit.mockRestore();

      process.env[varName] = oldKey;
    });
  }

  testExitWithoutKey('SEARCH_API_CADIDB_HOST');
  testExitWithoutKey('SEARCH_API_CADIDB_USER');
  testExitWithoutKey('SEARCH_API_CADIDB_PASSWORD');
  testExitWithoutKey('SEARCH_API_CADIDB_DATABASE');
  testExitWithoutKey('SEARCH_API_CADIDB_PORT');

  test('It should have correct config', () => {
    const cadidbConfig = require('../src/configs/cadidb.config');
    expect(cadidbConfig.db.host).toBe('host');
    expect(cadidbConfig.db.user).toBe('user');
    expect(cadidbConfig.db.password).toBe('password');
    expect(cadidbConfig.db.database).toBe('database');
    expect(cadidbConfig.db.port).toBe('port');
  });
});
