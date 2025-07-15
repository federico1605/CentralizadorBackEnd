import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// 1. Simular el módulo ANTES de cualquier importación
jest.unstable_mockModule('../../models/facultad.model.js', () => ({
  obtenerTodas: jest.fn(),
}));

jest.unstable_mockModule('../../config/logger.js', () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// 2. Describir la suite de pruebas
describe('Servicio de Facultad', () => {
  let FacultadModel;
  let listarFacultades;
  let logger;

  // 3. Importar los módulos dinámicamente antes de cada prueba
  beforeEach(async () => {
    // Limpiar mocks para asegurar un estado limpio
    jest.clearAllMocks();

    FacultadModel = (await import('../../models/facultad.model.js'));
    const service = await import('../facultad.service.js');
    listarFacultades = service.listarFacultades;
    logger = (await import('../../config/logger.js')).default;
  });

  // 4. Las pruebas ahora usarán los mocks correctos
  describe('listarFacultades', () => {
    it('debería devolver una lista de facultades exitosamente', async () => {
      const facultadesMock = [
        { id: '1', nombre: 'Facultad de Ingeniería' },
        { id: '2', nombre: 'Facultad de Artes' }
      ];
      FacultadModel.obtenerTodas.mockResolvedValue(facultadesMock);

      const resultado = await listarFacultades();

      expect(resultado.success).toBe(true);
      expect(resultado.data).toEqual(facultadesMock);
      expect(FacultadModel.obtenerTodas).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining(`Se obtuvo la lista con ${facultadesMock.length} facultades.`));
    });

    it('debería lanzar un error si el modelo falla', async () => {
      const errorMock = new Error('Error de base de datos');
      errorMock.statusCode = 500;
      FacultadModel.obtenerTodas.mockRejectedValue(errorMock);

      await expect(listarFacultades()).rejects.toThrow(errorMock);

      expect(FacultadModel.obtenerTodas).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Error en el servicio al obtener la lista de facultades:'), errorMock);
    });

    it('debería asignar un statusCode 500 si el error no lo tiene', async () => {
        const errorMock = new Error('Error genérico');
        FacultadModel.obtenerTodas.mockRejectedValue(errorMock);
  
        try {
          await listarFacultades();
        } catch (error) {
          expect(error.statusCode).toBe(500);
        }
  
        expect(FacultadModel.obtenerTodas).toHaveBeenCalledTimes(1);
      });
  });
});