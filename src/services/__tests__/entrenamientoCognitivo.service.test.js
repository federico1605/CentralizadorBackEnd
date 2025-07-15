import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Simular dependencias
jest.unstable_mockModule('../../models/estudiantesEntrenamientos.model.js', () => ({
    obtenerEntrenamientoCognitivoPorDocumento: jest.fn(),
    crearEntrenamientoCognitivoDB: jest.fn(),
    modificarEntrenamientoCognitivoDB: jest.fn(),
    crearSesionDB: jest.fn(),
    finalizarSesionDB: jest.fn(),
    finalizarAsignacionVariableDB: jest.fn(),
}));

jest.unstable_mockModule('../../config/logger.js', () => ({
  default: {
    info: jest.fn(), error: jest.fn(), debug: jest.fn(), warn: jest.fn(),
  },
}));

// ¡Clave! Simular el módulo de utilidades de respuesta
jest.unstable_mockModule('../../utils/response.util.js', () => ({
  throwClientError: jest.fn((message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    throw error;
  }),
}));

describe('Servicio de EntrenamientoCognitivo', () => {
    let EntrenamientoService;
    let EntrenamientoModel;
    let responseUtil;

    beforeEach(async () => {
        jest.clearAllMocks();
        EntrenamientoModel = (await import('../../models/estudiantesEntrenamientos.model.js'));
        EntrenamientoService = await import('../entrenamientoCognitivo.service.js');
        responseUtil = await import('../../utils/response.util.js');
    });

  describe('modificarEntrenamientoCognitivo', () => {
    it('debería lanzar un ClientError si el entrenamiento no se encuentra', async () => {
        const mockResponse = { mensaje: 'El estudiante no tiene un entrenamiento activo' };
        EntrenamientoModel.modificarEntrenamientoCognitivoDB.mockResolvedValue(mockResponse);
        
        await expect(EntrenamientoService.modificarEntrenamientoCognitivo('CC', '123', {}))
            .rejects.toThrow(mockResponse.mensaje);
        
        expect(responseUtil.throwClientError).toHaveBeenCalledWith(mockResponse.mensaje, 404);
      });
  });

  describe('crearNuevaSesion', () => {
    it('debería lanzar un ClientError si faltan datos', async () => {
        const expectedError = 'Se requieren los datos del estudiante y el nombre de la variable.';
        await expect(EntrenamientoService.crearNuevaSesion({}))
            .rejects.toThrow(expectedError);
        expect(responseUtil.throwClientError).toHaveBeenCalledWith(expectedError, 400);
      });
  });

  describe('finalizarSesion', () => {
    it('debería finalizar una sesión exitosamente', async () => {
        const mockResponse = { mensaje: 'Sesión finalizada' };
        EntrenamientoModel.finalizarSesionDB.mockResolvedValue(mockResponse);
        const result = await EntrenamientoService.finalizarSesion('d515b2e9-8548-4307-8444-2453187b5a28', {}, {});
        expect(result.mensaje).toBe(mockResponse.mensaje);
      });
  
      it('debería lanzar un ClientError si la BD devuelve un error', async () => {
        const mockResponse = { mensaje: 'Error: La sesión ya está finalizada' };
        EntrenamientoModel.finalizarSesionDB.mockResolvedValue(mockResponse);
        
        await expect(EntrenamientoService.finalizarSesion('d515b2e9-8548-4307-8444-2453187b5a28', {}, {}))
            .rejects.toThrow(mockResponse.mensaje);
        expect(responseUtil.throwClientError).toHaveBeenCalledWith(mockResponse.mensaje, 400);
      });
  });

  describe('finalizarAsignacionVariable', () => {
    it('debería lanzar un ClientError si el ID no es un UUID válido', async () => {
      const expectedError = 'El ID de la asignación de variable es requerido y debe ser un UUID válido.';
      await expect(EntrenamientoService.finalizarAsignacionVariable('id-invalido'))
            .rejects.toThrow(expectedError);
      expect(responseUtil.throwClientError).toHaveBeenCalledWith(expectedError, 400);
    });
  });

});