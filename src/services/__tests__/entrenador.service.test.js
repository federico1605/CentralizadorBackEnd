import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Simular el MODELO, no la BD
jest.unstable_mockModule('../../models/entrenador.model.js', () => ({
  registrar: jest.fn(),
  obtenerTodos: jest.fn(),
  actualizar: jest.fn(),
  desactivar: jest.fn(),
  obtenerFacultadesPorEmailDB: jest.fn(),
}));

jest.unstable_mockModule('../../config/logger.js', () => ({
  default: { info: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

// Mock de utilidades para que los errores se manejen correctamente
jest.unstable_mockModule('../../utils/response.util.js', () => ({
  throwClientError: jest.fn((message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    throw error;
  }),
}));

describe('Entrenador Service', () => {
  let EntrenadorModel;
  let EntrenadorService;

  beforeEach(async () => {
    jest.clearAllMocks();
    EntrenadorModel = (await import('../../models/entrenador.model.js'));
    EntrenadorService = await import('../entrenador.service.js');
  });

  describe('registrarEntrenador', () => {
    it('debería registrar exitosamente un entrenador', async () => {
      const mockResponse = { identrenador: 'entrenador-uuid' };
      EntrenadorModel.registrar.mockResolvedValue(mockResponse);
      const datos = { nombres: 'Juan', correo: 'juan@test.com' };
      const res = await EntrenadorService.registrarEntrenador(datos);
      expect(res.success).toBe(true);
      expect(res.data).toEqual(mockResponse);
    });

    it('debería manejar error de unicidad (correo)', async () => {
      const error = { code: '23505', detail: 'Key (correo)=(repetido@test.com) already exists.' };
      EntrenadorModel.registrar.mockRejectedValue(error);
      const datos = { nombres: 'Juan', correo: 'repetido@test.com' };
      await expect(EntrenadorService.registrarEntrenador(datos)).rejects.toThrow('El correo electrónico ingresado ya está registrado.');
    });
  });

  describe('obtenerListaCompletaEntrenadores', () => {
    it('debería obtener la lista de entrenadores', async () => {
      const entrenadoresMock = [{ id: 1, nombres: 'Test' }];
      EntrenadorModel.obtenerTodos.mockResolvedValue(entrenadoresMock);
      const res = await EntrenadorService.obtenerListaCompletaEntrenadores();
      expect(res.data).toEqual(entrenadoresMock);
      expect(res.success).toBe(true);
    });
  });

  describe('modificarInformacionEntrenador', () => {
    it('debería modificar exitosamente un entrenador', async () => {
      const mockResponse = { mensaje: 'actualiza' };
      EntrenadorModel.actualizar.mockResolvedValue(mockResponse);
      const res = await EntrenadorService.modificarInformacionEntrenador('id', { nombres: 'Nuevo' });
      expect(res.success).toBe(true);
      expect(res.data).toEqual(mockResponse);
    });
  });

  describe('desactivarEntrenador', () => {
    it('debería desactivar exitosamente un entrenador', async () => {
      const mockResponse = { exito: true, mensaje: 'ok', entrenadorid: 'id' };
      EntrenadorModel.desactivar.mockResolvedValue(mockResponse);
      const res = await EntrenadorService.desactivarEntrenador('id');
      expect(res.success).toBe(true);
      expect(res.message).toBe('ok');
    });
  });

  describe('obtenerFacultadesPorEmailService', () => {
    it('debería obtener facultades por email', async () => {
      const facultadesMock = [{ id: 1, nombre_facultad: 'Ingeniería' }];
      EntrenadorModel.obtenerFacultadesPorEmailDB.mockResolvedValue(facultadesMock);
      const res = await EntrenadorService.obtenerFacultadesPorEmailService('correo@test.com');
      expect(res).toEqual(facultadesMock);
    });
  });
});