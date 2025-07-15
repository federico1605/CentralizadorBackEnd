import { jest } from '@jest/globals';

export const debug = jest.fn();
export const info = jest.fn();
export const warn = jest.fn();
export const error = jest.fn();

const logger = {
  debug,
  info,
  warn,
  error,
};

export default logger; 