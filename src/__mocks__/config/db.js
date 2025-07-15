import { jest } from '@jest/globals';

const pool = {
  query: jest.fn(() => Promise.resolve({ rows: [], rowCount: 0 })),
};

export default pool; 