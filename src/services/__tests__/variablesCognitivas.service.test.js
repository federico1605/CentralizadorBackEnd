import { describe, it, expect, afterEach, jest } from '@jest/globals';
import {
  abandonarVariableCognitiva,
  reactivarVariableCognitiva,
  obtenerIdVariableCognitivaPorNombre,
} from '../variablesCognitivas.service.js';
import * as VariablesCognitivasModel from '../../models/variablesCognitivas.model.js';
import logger from '../../config/logger.js';

jest.mock('../../models/variablesCognitivas.model.js');
jest.mock('../../config/logger.js');

describe('Servicio de VariablesCognitivas', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const datosComunes = {
    siglaDocumento: 'CC',
    numeroDocumento: '12345',
    idVariableCognitiva: 'uuid-variable-1',
  };

  describe('abandonarVariableCognitiva', () => {
    it('debería abandonar una variable exitosamente', async () => {
      const resultadoMock = { exito: true, mensaje: 'Operación exitosa.' };
      VariablesCognitivasModel.abandonarVariableCognitiva.mockResolvedValue(resultadoMock);

      const resultado = await abandonarVariableCognitiva(datosComunes);

      expect(resultado).toEqual(resultadoMock);
    });

    it('debería lanzar un error si faltan datos', async () => {
      const errorEsperado = new Error('Datos incompletos. Se requiere siglaDocumento, numeroDocumento y idVariableCognitiva.');
      errorEsperado.statusCode = 400;
      
      await expect(abandonarVariableCognitiva({})).rejects.toThrow(errorEsperado);
    });

    it('debería lanzar un error si el modelo devuelve un fallo', async () => {
        const resultadoMock = { exito: false, mensaje: 'No se pudo abandonar.' };
        VariablesCognitivasModel.abandonarVariableCognitiva.mockResolvedValue(resultadoMock);
  
        const errorEsperado = new Error(resultadoMock.mensaje);
        errorEsperado.statusCode = 400;
  
        await expect(abandonarVariableCognitiva(datosComunes)).rejects.toThrow(errorEsperado);
      });
  });

  describe('reactivarVariableCognitiva', () => {
    it('debería reactivar una variable exitosamente', async () => {
      const resultadoMock = { exito: true, mensaje: 'Reactivación exitosa.' };
      VariablesCognitivasModel.reactivarVariableCognitiva.mockResolvedValue(resultadoMock);

      const resultado = await reactivarVariableCognitiva(datosComunes);

      expect(resultado).toEqual(resultadoMock);
    });

    it('debería lanzar un error si faltan datos', async () => {
      const errorEsperado = new Error('Datos incompletos para reactivar. Se requiere siglaDocumento, numeroDocumento y idVariableCognitiva.');
      errorEsperado.statusCode = 400;

      await expect(reactivarVariableCognitiva({})).rejects.toThrow(errorEsperado);
    });

    it('debería lanzar un error si el modelo devuelve un fallo', async () => {
        const resultadoMock = { exito: false, mensaje: 'No se pudo reactivar.' };
        VariablesCognitivasModel.reactivarVariableCognitiva.mockResolvedValue(resultadoMock);
  
        // CORRECCIÓN: El mensaje de error esperado debe ser el del mock.
        const errorEsperado = new Error(resultadoMock.mensaje);
        errorEsperado.statusCode = 400;
  
        await expect(reactivarVariableCognitiva(datosComunes)).rejects.toThrow(errorEsperado);
      });
  });

  describe('obtenerIdVariableCognitivaPorNombre', () => {
    const nombreVariable = 'Atención Sostenida';
    it('debería obtener el ID de una variable por su nombre', async () => {
      const resultadoMock = { id: 'uuid-atencion-sostenida' };
      VariablesCognitivasModel.obtenerIdVariableCognitivaPorNombre.mockResolvedValue(resultadoMock);

      const resultado = await obtenerIdVariableCognitivaPorNombre(nombreVariable);

      expect(resultado).toEqual(resultadoMock);
    });

    it('debería lanzar un error si no se proporciona el nombre', async () => {
      const errorEsperado = new Error('El nombre de la variable cognitiva es requerido.');
      errorEsperado.statusCode = 400;

      await expect(obtenerIdVariableCognitivaPorNombre(null)).rejects.toThrow(errorEsperado);
    });

    it('debería lanzar un error si la variable no se encuentra', async () => {
      VariablesCognitivasModel.obtenerIdVariableCognitivaPorNombre.mockResolvedValue(null);

      const errorEsperado = new Error(`Variable cognitiva con nombre "${nombreVariable}" no encontrada.`);
      errorEsperado.statusCode = 404;

      await expect(obtenerIdVariableCognitivaPorNombre(nombreVariable)).rejects.toThrow(errorEsperado);
    });
  });
});