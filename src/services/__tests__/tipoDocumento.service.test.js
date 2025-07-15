import { describe, it, expect, afterEach, jest } from '@jest/globals';
import { listarTiposDocumento } from '../tipoDocumento.service.js';
import * as TipoDocumentoModel from '../../models/tipoDocumento.model.js';
import logger from '../../config/logger.js';

jest.mock('../../models/tipoDocumento.model.js');
jest.mock('../../config/logger.js');

describe('Servicio de TipoDocumento', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listarTiposDocumento', () => {
    it('debería devolver una lista de tipos de documento exitosamente', async () => {
      const tiposDocMock = [
        { id: '1', sigla: 'CC', nombre: 'Cédula de Ciudadanía' },
        { id: '2', sigla: 'TI', nombre: 'Tarjeta de Identidad' }
      ];
      TipoDocumentoModel.obtenerTodos.mockResolvedValue(tiposDocMock);

      const resultado = await listarTiposDocumento();

      expect(resultado.success).toBe(true);
      expect(resultado.data).toEqual(tiposDocMock);
      expect(TipoDocumentoModel.obtenerTodos).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining(`Se obtuvo la lista con ${tiposDocMock.length} tipos de documento.`));
    });

    it('debería lanzar un error si el modelo falla', async () => {
      const errorMock = new Error('Error de base de datos');
      errorMock.statusCode = 500;
      TipoDocumentoModel.obtenerTodos.mockRejectedValue(errorMock);

      await expect(listarTiposDocumento()).rejects.toThrow(errorMock);

      expect(TipoDocumentoModel.obtenerTodos).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Error en el servicio al obtener la lista de tipos de documento:'), errorMock);
    });

    it('debería asignar un statusCode 500 si el error no lo tiene', async () => {
        const errorMock = new Error('Error genérico');
        TipoDocumentoModel.obtenerTodos.mockRejectedValue(errorMock);
  
        try {
          await listarTiposDocumento();
        } catch (error) {
          expect(error.statusCode).toBe(500);
        }
  
        expect(TipoDocumentoModel.obtenerTodos).toHaveBeenCalledTimes(1);
      });
  });
});