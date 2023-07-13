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
  test('It should execute the query and return the result', async () => {
    const mockConnection = {
      query: jest.fn().mockResolvedValue([[{ id: 1, name: 'Drebin' }]]),
      release: jest.fn()
    };

    mysql.createPool().getConnection.mockResolvedValue(mockConnection);

    const query = 'SELECT * FROM users';
    const values = [];
    const result = await cadidbService.sendQuery(query, values, 'test');

    expect(result).toEqual([{ id: 1, name: 'Drebin' }]);
    expect(mysql.createPool).toHaveBeenCalled();
    expect(mockConnection.query).toHaveBeenCalledWith(query, values, 'test');
    expect(mockConnection.release).toHaveBeenCalled();
  });
});
