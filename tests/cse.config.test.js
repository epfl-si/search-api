describe('Test CSE Config requirements', () => {
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

  test('It should exit without SEARCH_API_CSE_API_KEY', () => {
    const oldApiKey = process.env.SEARCH_API_CSE_API_KEY;
    delete process.env.SEARCH_API_CSE_API_KEY;

    const mockExit = jest.spyOn(process, 'exit').mockImplementation((num) => {
      throw new Error('process.exit: ' + num);
    });
    expect(() => {
      require('../src/configs/cse.config');
    }).toThrow();
    expect(mockExit).toHaveBeenCalledWith(1);
    expect(testOutput.length).toBe(1);
    expect(testOutput[0]).toMatch('error');
    mockExit.mockRestore();

    process.env.SEARCH_API_CSE_API_KEY = oldApiKey;
  });

  test('It should exit without SEARCH_API_CSE_CX', () => {
    const oldCx = process.env.SEARCH_API_CSE_CX;
    delete process.env.SEARCH_API_CSE_CX;

    const mockExit = jest.spyOn(process, 'exit').mockImplementation((num) => {
      throw new Error('process.exit: ' + num);
    });
    expect(() => {
      require('../src/configs/cse.config');
    }).toThrow();
    expect(mockExit).toHaveBeenCalledWith(1);
    expect(testOutput.length).toBe(1);
    expect(testOutput[0]).toMatch('error');
    mockExit.mockRestore();

    process.env.SEARCH_API_CSE_CX = oldCx;
  });

  test('It should have correct config', () => {
    const cseConfig = require('../src/configs/cse.config');
    expect(cseConfig.apiKey).toBe('foo');
    expect(cseConfig.cx).toBe('bar');
  });
});
