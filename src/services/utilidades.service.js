import * as UtilidadesModel from '../models/utilidades.model.js';
import logger from '../config/logger.js';

/**
 * @file Contiene los servicios para funcionalidades de utilidad general.
 */

/**
 * @typedef {import('../models/utilidades.model.js').GeneroVista} GeneroVista
 * @typedef {import('../models/utilidades.model.js').TipoDocumentoVista} TipoDocumentoVista
 */

/**
 * Servicio para listar todos los géneros disponibles.
 * @async
 * @returns {Promise<{success: boolean, data?: GeneroVista[], message?: string}>}
 *          Objeto indicando éxito y la lista de géneros.
 * @throws {Error} Si ocurre un error inesperado.
 */
export const listarTodosGenerosService = async () => {
  logger.debug('[SERVICIO_UTILIDADES] Solicitud para listar todos los géneros.');
  try {
    const generos = await UtilidadesModel.obtenerTodosLosGeneros();
    logger.info(`[SERVICIO_UTILIDADES] Se obtuvieron ${generos.length} géneros.`);
    return { success: true, data: generos, message: 'Lista de géneros obtenida exitosamente.' };
  } catch (error) {
    logger.error('[SERVICIO_UTILIDADES] Error en el servicio al listar géneros:', error);
    if (!error.statusCode) {
        error.statusCode = 500;
    }
    throw error;
  }
};

/**
 * Servicio para listar todos los tipos de documento disponibles.
 * @async
 * @returns {Promise<{success: boolean, data?: TipoDocumentoVista[], message?: string}>}
 *          Objeto indicando éxito y la lista de tipos de documento.
 * @throws {Error} Si ocurre un error inesperado.
 */
export const listarTodosTiposDocumentoService = async () => {
  logger.debug('[SERVICIO_UTILIDADES] Solicitud para listar todos los tipos de documento.');
  try {
    const tiposDocumento = await UtilidadesModel.obtenerTodosLosTiposDocumento();
    logger.info(`[SERVICIO_UTILIDADES] Se obtuvieron ${tiposDocumento.length} tipos de documento.`);
    return { success: true, data: tiposDocumento, message: 'Lista de tipos de documento obtenida exitosamente.' };
  } catch (error) {
    logger.error('[SERVICIO_UTILIDADES] Error en el servicio al listar tipos de documento:', error);
    if (!error.statusCode) {
        error.statusCode = 500;
    }
    throw error;
  }
};

/**
 * @typedef {import('../models/utilidades.model.js').ProgramaVista} ProgramaVista
 * @typedef {import('../models/utilidades.model.js').TipoVariableCognitivaVista} TipoVariableCognitivaVista
 */

/**
 * Servicio para listar todos los programas disponibles.
 * @async
 * @returns {Promise<{success: boolean, data?: ProgramaVista[], message?: string}>}
 *          Objeto indicando éxito y la lista de programas.
 * @throws {Error} Si ocurre un error inesperado.
 */
export const listarTodosProgramasService = async () => {
  logger.debug('[SERVICIO_UTILIDADES] Solicitud para listar todos los programas.');
  try {
    const programas = await UtilidadesModel.obtenerTodosLosProgramas();
    logger.info(`[SERVICIO_UTILIDADES] Se obtuvieron ${programas.length} programas.`);
    return { success: true, data: programas, message: 'Lista de programas obtenida exitosamente.' };
  } catch (error) {
    logger.error('[SERVICIO_UTILIDADES] Error en el servicio al listar programas:', error);
    if (!error.statusCode) {
        error.statusCode = 500;
    }
    throw error;
  }
};

/**
 * Servicio para obtener el ID de un estudiante por su tipo y número de documento.
 * Realiza validaciones básicas de entrada.
 * @async
 * @param {string} tipoDocumento - Sigla del tipo de documento del estudiante.
 * @param {string} numeroDocumento - Número de documento del estudiante.
 * @returns {Promise<{success: boolean, data?: string | null, message?: string, statusCode?: number}>}
 *          Objeto indicando éxito, el ID del estudiante o un mensaje de error.
 * @throws {Error} Si ocurre un error inesperado en el modelo.
 */
export const obtenerIdEstudiantePorDocumentoService = async (tipoDocumento, numeroDocumento) => {
  logger.debug(`[SERVICIO_UTILIDADES] Solicitud para obtener ID de estudiante: tipoDoc=${tipoDocumento}, numDoc=${numeroDocumento}`);

  // Validaciones básicas de entrada
  if (!tipoDocumento || typeof tipoDocumento !== 'string' || tipoDocumento.trim() === '') {
    return { success: false, message: 'El tipo de documento es requerido y debe ser una cadena de texto no vacía.', statusCode: 400 };
  }
  if (!numeroDocumento || typeof numeroDocumento !== 'string' || numeroDocumento.trim() === '') {
    return { success: false, message: 'El número de documento es requerido y debe ser una cadena de texto no vacía.', statusCode: 400 };
  }

  try {
    const estudianteId = await UtilidadesModel.obtenerIdEstudiantePorDocumentoDB(tipoDocumento.trim(), numeroDocumento.trim());

    if (estudianteId) {
      logger.info(`[SERVICIO_UTILIDADES] ID de estudiante encontrado: ${estudianteId}`);
      return { success: true, data: estudianteId, message: 'ID de estudiante obtenido exitosamente.' };
    } else {
      logger.info(`[SERVICIO_UTILIDADES] No se encontró estudiante para tipoDoc=${tipoDocumento}, numDoc=${numeroDocumento}.`);
      return { success: false, message: 'No se encontró estudiante con el tipo y número de documento especificados.', statusCode: 404 };
    }
  } catch (error) {
    logger.error(`[SERVICIO_UTILIDADES] Error en el servicio al obtener ID de estudiante por documento: ${error.message}`);
    if (!error.statusCode) {
        error.statusCode = 500;
    }
    throw error;
  }
};

/**
 * Servicio para listar todos los tipos de variables cognitivas disponibles.
 * @async
 * @returns {Promise<{success: boolean, data?: TipoVariableCognitivaVista[], message?: string}>}
 *          Objeto indicando éxito y la lista de tipos de variables cognitivas.
 * @throws {Error} Si ocurre un error inesperado.
 */
export const listarTiposVariablesCognitivasService = async () => {
  logger.debug('[SERVICIO_UTILIDADES] Solicitud para listar todos los tipos de variables cognitivas.');
  try {
    const tiposVariables = await UtilidadesModel.obtenerTiposVariablesCognitivasDB();
    logger.info(`[SERVICIO_UTILIDADES] Se obtuvieron ${tiposVariables.length} tipos de variables cognitivas.`);
    return { success: true, data: tiposVariables, message: 'Lista de tipos de variables cognitivas obtenida exitosamente.' };
  } catch (error) {
    logger.error('[SERVICIO_UTILIDADES] Error en el servicio al listar tipos de variables cognitivas:', error);
    if (!error.statusCode) {
        error.statusCode = 500;
    }
    throw error;
  }
}; 