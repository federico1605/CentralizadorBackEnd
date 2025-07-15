import { describe, it, expect, afterEach, jest } from '@jest/globals';
import {
  listarTodosGenerosService,
  listarTodosTiposDocumentoService,
  listarTodosProgramasService,
  obtenerIdEstudiantePorDocumentoService,
  listarTiposVariablesCognitivasService,
} from '../utilidades.service.js';
import * as UtilidadesModel from '../../models/utilidades.model.js';
import logger from '../../config/logger.js';

jest.mock('../../models/utilidades.model.js');
jest.mock('../../config/logger.js');

describe('Servicio de Utilidades', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listarTodosGenerosService', () => {
    it('debería devolver una lista de géneros', async () => {
      const generosMock = [{ id: 1, nombre: 'Masculino' }];
      UtilidadesModel.obtenerTodosLosGeneros.mockResolvedValue(generosMock);
      const resultado = await listarTodosGenerosService();
      expect(resultado.success).toBe(true);
      expect(resultado.data).toEqual(generosMock);
    });

    it('debería lanzar un error si el modelo falla', async () => {
      const errorMock = new Error('Error de BD');
      UtilidadesModel.obtenerTodosLosGeneros.mockRejectedValue(errorMock);
      await expect(listarTodosGenerosService()).rejects.toThrow(errorMock);
    });
  });

  describe('listarTodosTiposDocumentoService', () => {
    it('debería devolver una lista de tipos de documento', async () => {
      const tiposDocMock = [{ id: 1, sigla: 'CC' }];
      UtilidadesModel.obtenerTodosLosTiposDocumento.mockResolvedValue(tiposDocMock);
      const resultado = await listarTodosTiposDocumentoService();
      expect(resultado.success).toBe(true);
      expect(resultado.data).toEqual(tiposDocMock);
    });

    it('debería lanzar un error si el modelo falla', async () => {
      const errorMock = new Error('Error de BD');
      UtilidadesModel.obtenerTodosLosTiposDocumento.mockRejectedValue(errorMock);
      await expect(listarTodosTiposDocumentoService()).rejects.toThrow(errorMock);
    });
  });

  describe('listarTodosProgramasService', () => {
    it('debería devolver una lista de programas', async () => {
      const programasMock = [{ id: 1, nombre: 'Ingeniería de Sistemas' }];
      UtilidadesModel.obtenerTodosLosProgramas.mockResolvedValue(programasMock);
      const resultado = await listarTodosProgramasService();
      expect(resultado.success).toBe(true);
      expect(resultado.data).toEqual(programasMock);
    });

    it('debería lanzar un error si el modelo falla', async () => {
        const errorMock = new Error('Error de BD');
        UtilidadesModel.obtenerTodosLosProgramas.mockRejectedValue(errorMock);
        await expect(listarTodosProgramasService()).rejects.toThrow(errorMock);
      });
  });

  describe('obtenerIdEstudiantePorDocumentoService', () => {
    it('debería devolver el ID del estudiante si se encuentra', async () => {
      const estudianteIdMock = 'uuid-estudiante-1';
      UtilidadesModel.obtenerIdEstudiantePorDocumentoDB.mockResolvedValue(estudianteIdMock);
      const resultado = await obtenerIdEstudiantePorDocumentoService('CC', '12345');
      expect(resultado.success).toBe(true);
      expect(resultado.data).toBe(estudianteIdMock);
    });

    it('debería devolver un resultado fallido si el estudiante no se encuentra', async () => {
      UtilidadesModel.obtenerIdEstudiantePorDocumentoDB.mockResolvedValue(null);
      const resultado = await obtenerIdEstudiantePorDocumentoService('CC', '12345');
      expect(resultado.success).toBe(false);
      expect(resultado.statusCode).toBe(404);
    });

    it('debería devolver un error de validación para tipo de documento inválido', async () => {
        const resultado = await obtenerIdEstudiantePorDocumentoService('', '12345');
        expect(resultado.success).toBe(false);
        expect(resultado.statusCode).toBe(400);
      });
  
      it('debería devolver un error de validación para número de documento inválido', async () => {
        const resultado = await obtenerIdEstudiantePorDocumentoService('CC', ' ');
        expect(resultado.success).toBe(false);
        expect(resultado.statusCode).toBe(400);
      });
  });

  describe('listarTiposVariablesCognitivasService', () => {
    it('debería devolver una lista de tipos de variables cognitivas', async () => {
        const tiposVarMock = [{ id: 'uuid-var-1', nombre: 'Atención' }];
        UtilidadesModel.obtenerTiposVariablesCognitivasDB.mockResolvedValue(tiposVarMock);
        const resultado = await listarTiposVariablesCognitivasService();
        expect(resultado.success).toBe(true);
        expect(resultado.data).toEqual(tiposVarMock);
      });
  
      it('debería lanzar un error si el modelo falla', async () => {
        const errorMock = new Error('Error de BD');
        UtilidadesModel.obtenerTiposVariablesCognitivasDB.mockRejectedValue(errorMock);
        await expect(listarTiposVariablesCognitivasService()).rejects.toThrow(errorMock);
      });
  });
}); 