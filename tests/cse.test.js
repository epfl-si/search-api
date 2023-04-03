const request = require('supertest');
const app = require('../src/app');

const cseService = require('../src/services/cse.service');

cseService.get = jest.fn().mockReturnValue('{}');

// jest.mock('../src/services/cse.service', async () => {
//   return new Promise(resolve => {
//     setTimeout(() => {
//       resolve('resolved');
//     }, 1000);
//   });
// });

describe('Test API CSE ("/api/cse")', () => {
  test('It should response the GET method', async () => {

  });
});
