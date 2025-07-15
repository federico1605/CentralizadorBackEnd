import { describe, it, expect, afterEach, jest } from '@jest/globals';
import {
  listarEntrenamientosParaAdmin,
  obtenerDetallesDeInformePorId,
  listarEntrenamientosEntrenador,
} from '../informe.service.js';
import * as InformeModel from '../../models/informe.model.js';
import logger from '../../config/logger.js';

jest.mock('../../models/informe.model.js');
jest.mock('../../config/logger.js');

describe('Servicio de Informe', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listarEntrenamientosParaAdmin', () => {
    it('debería devolver una lista de entrenamientos para el admin', async () => {
      const entrenamientosMock = [{ id: '1', nombre: 'Entrenamiento 1' }];
      InformeModel.obtenerListaEntrenamientosAdmin.mockResolvedValue(entrenamientosMock);

      const resultado = await listarEntrenamientosParaAdmin();

      expect(resultado.success).toBe(true);
      expect(resultado.data).toEqual(entrenamientosMock);
      expect(InformeModel.obtenerListaEntrenamientosAdmin).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining(`Se obtuvo lista con ${entrenamientosMock.length} entrenamientos para admin.`));
    });

    it('debería lanzar un error si el modelo falla', async () => {
      const errorMock = new Error('Error de BD');
      errorMock.statusCode = 500;
      InformeModel.obtenerListaEntrenamientosAdmin.mockRejectedValue(errorMock);

      await expect(listarEntrenamientosParaAdmin()).rejects.toThrow(errorMock);
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Error en servicio al listar entrenamientos para admin:'), errorMock);
    });
  });

  describe('obtenerDetallesDeInformePorId', () => {
    const entrenamientoId = 'some-uuid';
    it('debería devolver los detalles de un informe', async () => {
      const detallesMock = [{ variable: 'Atención', puntaje: 100 }];
      InformeModel.obtenerDetalleInformeEntrenamiento.mockResolvedValue(detallesMock);

      const resultado = await obtenerDetallesDeInformePorId(entrenamientoId);

      expect(resultado.success).toBe(true);
      expect(resultado.data).toEqual(detallesMock);
      expect(InformeModel.obtenerDetalleInformeEntrenamiento).toHaveBeenCalledWith(entrenamientoId);
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining(`Se obtuvieron ${detallesMock.length} registros de variables finalizadas`));
    });

    it('debería devolver un array vacío si no hay detalles', async () => {
        InformeModel.obtenerDetalleInformeEntrenamiento.mockResolvedValue([]);
  
        const resultado = await obtenerDetallesDeInformePorId(entrenamientoId);
  
        expect(resultado.success).toBe(true);
        expect(resultado.data).toEqual([]);
        expect(InformeModel.obtenerDetalleInformeEntrenamiento).toHaveBeenCalledWith(entrenamientoId);
        expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Se obtuvieron 0 registros'));
      });

    it('debería lanzar un error si el modelo falla', async () => {
      const errorMock = new Error('Error de BD');
      InformeModel.obtenerDetalleInformeEntrenamiento.mockRejectedValue(errorMock);

      await expect(obtenerDetallesDeInformePorId(entrenamientoId)).rejects.toThrow(errorMock);
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining(`Error en servicio al obtener detalles del informe para ID ${entrenamientoId}`), errorMock);
    });
  });

  describe('listarEntrenamientosEntrenador', () => {
    const entrenadorId = 'some-entrenador-uuid';
    it('debería devolver una lista de entrenamientos para un entrenador', async () => {
      const entrenamientosMock = [{ id: '1', estudiante: 'Estudiante 1' }];
      InformeModel.obtenerListaEntrenamientosEntrenador.mockResolvedValue(entrenamientosMock);

      const resultado = await listarEntrenamientosEntrenador(entrenadorId);

      expect(resultado.success).toBe(true);
      expect(resultado.data).toEqual(entrenamientosMock);
      expect(InformeModel.obtenerListaEntrenamientosEntrenador).toHaveBeenCalledWith(entrenadorId);
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining(`Se obtuvo lista con ${entrenamientosMock.length} entrenamientos para el entrenador.`));
    });

    it('debería lanzar un error si el modelo falla', async () => {
      const errorMock = new Error('Error de BD');
      InformeModel.obtenerListaEntrenamientosEntrenador.mockRejectedValue(errorMock);

      await expect(listarEntrenamientosEntrenador(entrenadorId)).rejects.toThrow(errorMock);
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Error en servicio al listar entrenamientos para entrenador:'), errorMock);
    });
  });
});