// Configuración global para las pruebas
import { jest } from '@jest/globals';

// Configurar timeouts más largos para pruebas de integración
jest.setTimeout(10000);

// Mock global de console para evitar logs en las pruebas
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}; 