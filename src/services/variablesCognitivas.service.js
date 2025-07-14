
import { 
    abandonarVariableCognitiva as abandonarVariableCognitivaModel, 
    reactivarVariableCognitiva as reactivarVariableCognitivaModel, 
    obtenerIdVariableCognitivaPorNombre as obtenerIdVariableCognitivaPorNombreModel 
} from '../models/variablesCognitivas.model.js';
import logger from '../config/logger.js'; 

/**
 * Servicio para marcar una variable cognitiva como 'Abandono'.
 * @param {object} datosAbandono - Datos necesarios para la operación.
 * @returns {Promise<object>} El resultado de la operación.
 * @throws {Error} Lanza un error con statusCode si la validación falla o la operación de BD no es exitosa.
 */
export const abandonarVariableCognitiva = async (datosAbandono) => {
  const { siglaDocumento, numeroDocumento, idVariableCognitiva } = datosAbandono;
  logger.debug('[SERVICIO_VARIABLES] Petición para abandonar variable', { datosAbandono });

  if (!siglaDocumento || !numeroDocumento || !idVariableCognitiva) {
    const error = new Error('Datos incompletos. Se requiere siglaDocumento, numeroDocumento y idVariableCognitiva.');
    error.statusCode = 400; // Bad Request
    throw error;
  }

  try {
    const resultado = await abandonarVariableCognitivaModel(siglaDocumento, numeroDocumento, idVariableCognitiva);

    if (!resultado || !resultado.exito) {
      const error = new Error(resultado?.mensaje || 'No se pudo completar la operación de abandono.');
      error.statusCode = 400; 
      logger.warn(`[SERVICIO_VARIABLES] Fallo controlado al abandonar variable: ${error.message}`);
      throw error;
    }

    logger.info(`[SERVICIO_VARIABLES] Variable ${idVariableCognitiva} abandonada exitosamente para estudiante ${numeroDocumento}.`);
    return resultado;
  } catch (error) {
    logger.error('[SERVICIO_VARIABLES] Error en servicio al abandonar variable:', error);
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    throw error; // Relanzar para que el controlador lo maneje
  }
};

/**
 * Servicio para reactivar una variable cognitiva.
 * @param {object} datosReactivacion - Datos necesarios para la operación.
 * @returns {Promise<object>} El resultado de la operación.
 * @throws {Error} Lanza un error con statusCode si la validación falla o la operación de BD no es exitosa.
 */
export const reactivarVariableCognitiva = async (datosReactivacion) => {
  const { siglaDocumento, numeroDocumento, idVariableCognitiva } = datosReactivacion;
  logger.debug('[SERVICIO_VARIABLES] Petición para reactivar variable', { datosReactivacion });

  if (!siglaDocumento || !numeroDocumento || !idVariableCognitiva) {
    const error = new Error('Datos incompletos para reactivar. Se requiere siglaDocumento, numeroDocumento y idVariableCognitiva.');
    error.statusCode = 400;
    throw error;
  }

  try {
    const resultado = await reactivarVariableCognitivaModel(siglaDocumento, numeroDocumento, idVariableCognitiva);

    if (!resultado || !resultado.exito) {
        const error = new Error(resultado?.mensaje || 'No se pudo completar la reactivación.');
        error.statusCode = 400;
        logger.warn(`[SERVICIO_VARIABLES] Fallo controlado al reactivar variable: ${error.message}`);
        throw error;
    }
    
    logger.info(`[SERVICIO_VARIABLES] Variable ${idVariableCognitiva} reactivada exitosamente para estudiante ${numeroDocumento}.`);
    return resultado;
  } catch (error) {
    logger.error('[SERVICIO_VARIABLES] Error en servicio al reactivar variable:', error);
    if (!error.statusCode) {
        error.statusCode = 500;
    }
    throw error;
  }
};

/**
 * Servicio para obtener el ID de una variable cognitiva por su nombre.
 * @param {string} nombre - El nombre de la variable.
 * @returns {Promise<object>} Objeto con el ID de la variable.
 * @throws {Error} Lanza un error con statusCode si no se encuentra.
 */
export const obtenerIdVariableCognitivaPorNombre = async (nombre) => {
  logger.debug(`[SERVICIO_VARIABLES] Buscando ID de variable por nombre: "${nombre}"`);
  if (!nombre) {
    const error = new Error('El nombre de la variable cognitiva es requerido.');
    error.statusCode = 400;
    throw error;
  }

  try {
    const resultado = await obtenerIdVariableCognitivaPorNombreModel(nombre);

    if (!resultado || !resultado.id) {
        const error = new Error(`Variable cognitiva con nombre "${nombre}" no encontrada.`);
        error.statusCode = 404; // Not Found
        throw error;
    }
    
    logger.info(`[SERVICIO_VARIABLES] ID encontrado para la variable "${nombre}": ${resultado.id}`);
    return resultado;
  } catch (error) {
    logger.error(`[SERVICIO_VARIABLES] Error en servicio al buscar ID de variable por nombre:`, error);
    if (!error.statusCode) {
        error.statusCode = 500;
    }
    throw error;
  }
};