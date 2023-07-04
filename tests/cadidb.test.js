const cadidbService = require('../src/services/cadidb.service');
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

describe('Test Cadi DB Service', () => {
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

  test('It should execute the query and return the result', async () => {
    const mockConnection = {
      query: jest.fn().mockResolvedValue([[{ id: 1, name: 'Drebin' }]]),
      release: jest.fn()
    };

    mysql.createPool().getConnection.mockResolvedValue(mockConnection);

    const query = 'SELECT * FROM users';
    const values = [];
    const result = await cadidbService.sendQuery(query, values, 'default');

    expect(result).toEqual([{ id: 1, name: 'Drebin' }]);
    expect(mysql.createPool).toHaveBeenCalled();
    expect(mockConnection.query).toHaveBeenCalledWith(query, values, 'default');
    expect(mockConnection.release).toHaveBeenCalled();
  });

  test('It should execute the query and return the result', async () => {
    const mockConnection = {
      query: jest.fn().mockRejectedValue(new Error('Error executing query')),
      release: jest.fn()
    };

    mysql.createPool().getConnection.mockResolvedValue(mockConnection);

    const query = 'SELECT * FROM users';
    const values = [];
    await cadidbService.sendQuery(query, values);

    expect(mysql.createPool).toHaveBeenCalled();
    expect(mockConnection.query).toHaveBeenCalledWith(query, values, 'default');
    expect(mockConnection.release).toHaveBeenCalled();
    expect(testOutput.length).toBe(1);
    expect(testOutput[0]).toMatch('Error executing query');
  });
});
