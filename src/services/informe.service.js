import * as InformeModel from '../models/informe.model.js';
import logger from '../config/logger.js';

/**
 * @file Contiene los servicios para la gestión de informes de administración.
 */

/**
 * Servicio para obtener la lista de entrenamientos cognitivos para la vista de administración.
 * Llama al modelo para obtener los datos.
 * @async
 * @returns {Promise<object>} Objeto indicando éxito y los datos de los entrenamientos.
 * @throws {Error} Si ocurre un error durante la obtención de datos.
 */
export const listarEntrenamientosParaAdmin = async () => {
  logger.debug('[SERVICIO_INFORME] Solicitud para listar entrenamientos para admin.');
  try {
    const listaEntrenamientos = await InformeModel.obtenerListaEntrenamientosAdmin();
    logger.info(`[SERVICIO_INFORME] Se obtuvo lista con ${listaEntrenamientos.length} entrenamientos para admin.`);
    return { success: true, data: listaEntrenamientos };
  } catch (error) {
    logger.error('[SERVICIO_INFORME] Error en servicio al listar entrenamientos para admin:', error);
    if (!error.statusCode) {
      error.statusCode = 500; // Error interno del servidor por defecto
    }
    throw error; // Relanzar para que el controlador lo maneje
  }
};

/**
 * Servicio para obtener el detalle de las variables finalizadas para un entrenamiento cognitivo específico.
 * @async
 * @param {string} entrenamientoId - El UUID del entrenamiento cognitivo.
 * @returns {Promise<object>} Objeto indicando éxito y los datos del detalle del informe.
 * @throws {Error} Si ocurre un error durante la obtención de datos.
 */
export const obtenerDetallesDeInformePorId = async (entrenamientoId) => {
  logger.debug(`[SERVICIO_INFORME] Solicitud para obtener detalles del informe para entrenamiento ID: ${entrenamientoId}`);
  try {
    const detallesInforme = await InformeModel.obtenerDetalleInformeEntrenamiento(entrenamientoId);
    // El modelo devuelve un array. Si está vacío, puede significar que el entrenamiento no existe
    // o que no tiene variables finalizadas. El servicio simplemente pasa los datos.
    logger.info(`[SERVICIO_INFORME] Se obtuvieron ${detallesInforme.length} registros de variables finalizadas para el informe ID: ${entrenamientoId}`);
    return { success: true, data: detallesInforme };
  } catch (error) {
    logger.error(`[SERVICIO_INFORME] Error en servicio al obtener detalles del informe para ID ${entrenamientoId}:`, error);
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    throw error;
  }
};



/**
 * Servicio para obtener la lista de entrenamientos cognitivos para un entrenador específico.
 * @async
 * @param {string} entrenadorId - El UUID del entrenador.
 * @returns {Promise<object>} Objeto indicando éxito y los datos de los entrenamientos.
 * @throws {Error} Si ocurre un error.
 */
export const listarEntrenamientosEntrenador = async (entrenadorId) => {
  logger.debug(`[SERVICIO_INFORME] Solicitud para listar entrenamientos para el entrenador ID: ${entrenadorId}`);
  try {
    const listaEntrenamientos = await InformeModel.obtenerListaEntrenamientosEntrenador(entrenadorId);
    logger.info(`[SERVICIO_INFORME] Se obtuvo lista con ${listaEntrenamientos.length} entrenamientos para el entrenador.`);
    return { success: true, data: listaEntrenamientos };
  } catch (error) {
    logger.error('[SERVICIO_INFORME] Error en servicio al listar entrenamientos para entrenador:', error);
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    throw error;
  }
};