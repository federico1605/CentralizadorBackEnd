import * as entrenadorModel from '../models/entrenador.model.js';
import logger from '../config/logger.js';
import { throwClientError } from '../utils/response.util.js';
/**
 * @file Contiene la lógica de negocio para la entidad Entrenador.
 */

/**
 * Servicio para registrar un nuevo entrenador.
 * @async
 * @param {object} datosParaRegistrar - Datos del entrenador a registrar.
 * @returns {Promise<object>} Objeto indicando éxito o fallo.
 */
export const registrarEntrenador = async (datosParaRegistrar) => {
  logger.debug('[SERVICIO_ENTRENADOR] Solicitud para registrar nuevo entrenador.', { body: datosParaRegistrar });
  
  try {
    const resultadoDB = await entrenadorModel.registrar(datosParaRegistrar);

    if (resultadoDB && resultadoDB.identrenador) {
        logger.info(`[SERVICIO_ENTRENADOR] Entrenador registrado exitosamente con ID: ${resultadoDB.identrenador}`);
        return { success: true, data: resultadoDB };
    }
    
    throw new Error("La operación en la base de datos no confirmó el registro.");

  } catch (error) {
    logger.error(`[SERVICIO_ENTRENADOR] Error en el flujo de registro de entrenador: ${error.message}`);

    if (error.statusCode) {
      throw error;
    }

    const lowerCaseMessage = (error.message || '').toLowerCase();
    
    if (error.code === '23505' || lowerCaseMessage.includes('unicidad') || lowerCaseMessage.includes('ccentrenador001uq') || lowerCaseMessage.includes('ccentrenador002uq')) {
      let userMessage = 'Ya existe un entrenador con el documento o correo proporcionado.';
      
      if (lowerCaseMessage.includes('correo') || (error.detail && error.detail.toLowerCase().includes('correo'))) {
        userMessage = 'El correo electrónico ingresado ya está registrado.';
      } else if (lowerCaseMessage.includes('documento')) {
        userMessage = 'Ya existe un entrenador con ese tipo y número de documento.';
      }
      
      throwClientError(userMessage, 409);
    }

    throwClientError('Ocurrió un error inesperado al registrar al entrenador.', 500);
  }
};

/**
 * Servicio para obtener la lista de entrenadores, con opción de aplicar filtros.
 * @async
 * @param {object} [filtrosDeUrl={}] - Objeto opcional con filtros.
 * @returns {Promise<object>} Objeto indicando éxito y los datos de los entrenadores.
 */
export const obtenerListaCompletaEntrenadores = async (filtrosDeUrl = {}) => {
  logger.debug('[SERVICIO_ENTRENADOR] Solicitud para obtener lista de entrenadores con filtros: %o', filtrosDeUrl);
  
  const filtrosParaModelo = {};
  if (filtrosDeUrl.nombreFacultad) {
    filtrosParaModelo.nombreFacultad = filtrosDeUrl.nombreFacultad;
  }

  try {
    const listaEntrenadores = await entrenadorModel.obtenerTodos(filtrosParaModelo);

    logger.info(`[SERVICIO_ENTRENADOR] Se obtuvo lista con ${listaEntrenadores.length} entrenadores.`);
    return { success: true, data: listaEntrenadores };
  } catch (error) {
    logger.error('[SERVICIO_ENTRENADOR] Error en servicio al obtener lista de entrenadores:', error);
    if (!error.statusCode) {
        error.statusCode = 500;
    }
    throw error;
  }
};

/**
 * Servicio para modificar la información de un entrenador.
 * @async
 * @param {string} entrenadorID - El UUID del entrenador a modificar.
 * @param {object} datosAActualizar - Campos con los nuevos valores.
 * @returns {Promise<object>} Objeto indicando el resultado.
 */
export const modificarInformacionEntrenador = async (entrenadorID, datosAActualizar) => {
  logger.debug(`[SERVICIO_ENTRENADOR] Solicitud para modificar entrenador ID: ${entrenadorID}`, { datosAActualizar });
  
  try {
    const resultadoDB = await entrenadorModel.actualizar(entrenadorID, datosAActualizar);

    if (!resultadoDB || !resultadoDB.mensaje) {
      throwClientError("La operación en la base de datos no produjo un resultado.", 500);
    }
    
    const { mensaje } = resultadoDB;
    const lowerCaseMessage = mensaje.toLowerCase();

    if (lowerCaseMessage.includes('actualiza') || lowerCaseMessage.includes('no se especificaron cambios')) {
      logger.info('[SERVICIO_ENTRENADOR] Información de entrenador modificada exitosamente.', { data: resultadoDB });
      return { success: true, data: resultadoDB };
    }

    logger.warn(`[SERVICIO_ENTRENADOR] La BD devolvió un error controlado al modificar: ${mensaje}`);

    if (lowerCaseMessage.includes('ya está en uso')) {
      throwClientError(mensaje, 409);
    } else if (lowerCaseMessage.includes('no encontrado')) {
      throwClientError(mensaje, 404);
    } else {
      throwClientError(mensaje, 400);
    }

  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    logger.error(`[SERVICIO_ENTRENADOR] Error inesperado en el servicio al modificar entrenador:`, error);
    throw new Error('Ocurrió un error inesperado en el servidor.');
  }
};

/**
 * Servicio para desactivar un entrenador.
 * @async
 * @param {string} entrenadorID - El UUID del entrenador a desactivar.
 * @returns {Promise<object>} Objeto indicando el resultado.
 */
export const desactivarEntrenador = async (entrenadorID) => {
  logger.debug('[SERVICIO_ENTRENADOR] Solicitud para desactivar entrenador ID: %s', entrenadorID);
  try {
    const resultadoDelModelo = await entrenadorModel.desactivar(entrenadorID);

    if (!resultadoDelModelo) {
      throw Object.assign(new Error('No se pudo completar la desactivación, la operación no produjo resultado.'), { statusCode: 500 });
    }

    if (!resultadoDelModelo.exito) {
        const statusCode = resultadoDelModelo.mensaje.toLowerCase().includes('no encontrado') ? 404 : 400;
        throw Object.assign(new Error(resultadoDelModelo.mensaje), { statusCode });
    }
    
    logger.info('[SERVICIO_ENTRENADOR] Entrenador desactivado exitosamente.', { data: resultadoDelModelo });
    return { success: true, message: resultadoDelModelo.mensaje, data: { entrenadorId: resultadoDelModelo.entrenadorid } };

  } catch (error) {
    logger.error('[SERVICIO_ENTRENADOR] Error en servicio al desactivar entrenador:', error);
    if (!error.statusCode) {
        error.statusCode = 500;
    }
    throw error;
  }
};


/**
 * Obtiene las facultades asociadas a un entrenador dado su correo electrónico.
 * Delega la consulta a la capa de datos (`entrenador.model.js`).
 * @async
 * @param {string} correo - El correo electrónico del entrenador.
 * @returns {Promise<Array<object>>} Un array de objetos con `facultad_id` y `nombre_facultad`.
 * @throws {Error} Si el correo electrónico no es válido o si ocurre un error en la base de datos.
 */
export const obtenerFacultadesPorEmailService = async (correo) => {
  if (!correo || typeof correo !== 'string' || !correo.includes('@')) {
    logger.warn('[SERVICIO_ENTRENADOR] Intento de consulta de facultades con correo inválido: %s', correo);
    throw new Error('Correo electrónico inválido.');
  }

  logger.info('[SERVICIO_ENTRENADOR] Solicitando facultades para el correo: %s', correo);
  try {
    const facultades = await entrenadorModel.obtenerFacultadesPorEmailDB(correo);
    logger.debug('[SERVICIO_ENTRENADOR] Facultades obtenidas del modelo: %o', facultades);
    return facultades;
  } catch (error) {
    logger.error('[SERVICIO_ENTRENADOR] Error al obtener facultades por email:', error);
    throw error; // Re-lanza el error para que el controlador lo maneje
  }
}; 

/**
 * Obtiene los datos de un entrenador por su correo electrónico.
 * @async
 * @param {string} correo - El correo electrónico del entrenador.
 * @returns {Promise<object>} Un objeto con los datos del entrenador o información de error.
 * @throws {Error} Si ocurre un error en la base de datos.
 */
export const obtenerDatosPorCorreoService = async (correo) => {
  // Validaciones básicas
  if (!correo || typeof correo !== 'string' || correo.trim() === '') {
    logger.warn('[SERVICIO_ENTRENADOR] Intento de consulta con correo inválido: %s', correo);
    throwClientError('El correo electrónico es requerido y debe ser una cadena de texto no vacía.', 400);
  }

  // Validación básica de formato de correo
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(correo.trim())) {
    logger.warn('[SERVICIO_ENTRENADOR] Correo electrónico no tiene formato válido: %s', correo);
    throwClientError('El correo electrónico debe tener un formato válido.', 400);
  }

  logger.info('[SERVICIO_ENTRENADOR] Solicitando datos de entrenador para correo: %s', correo);
  
  try {
    const resultado = await entrenadorModel.obtenerDatosPorCorreo(correo.trim());
    
    if (!resultado) {
      logger.info('[SERVICIO_ENTRENADOR] No se encontró entrenador con el correo proporcionado');
      throwClientError('No se encontró un entrenador con el correo electrónico proporcionado.', 404);
    }

    logger.info('[SERVICIO_ENTRENADOR] Datos de entrenador obtenidos exitosamente para correo: %s', correo);
    return { 
      success: true, 
      data: resultado,
      message: 'Datos del entrenador obtenidos exitosamente'
    };
    
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    logger.error('[SERVICIO_ENTRENADOR] Error al obtener datos de entrenador por correo:', error);
    throwClientError('Error interno del servidor al obtener los datos del entrenador.', 500);
  }
}; 

/**
 * Crea una relación entre un entrenador y un entrenamiento cognitivo.
 * @async
 * @param {string} entrenadorId - El UUID del entrenador.
 * @param {string} entrenamientoCognitivoId - El UUID del entrenamiento cognitivo.
 * @returns {Promise<object>} Un objeto con el resultado de la operación.
 * @throws {Error} Si ocurre un error durante la operación.
 */
export const crearEntrenadorEntrenamientoService = async (entrenadorId, entrenamientoCognitivoId) => {
  // Validaciones básicas
  if (!entrenadorId || typeof entrenadorId !== 'string' || entrenadorId.trim() === '') {
    logger.warn('[SERVICIO_ENTRENADOR] Intento de crear relación con ID de entrenador inválido: %s', entrenadorId);
    throwClientError('El ID del entrenador es requerido y debe ser una cadena de texto no vacía.', 400);
  }

  if (!entrenamientoCognitivoId || typeof entrenamientoCognitivoId !== 'string' || entrenamientoCognitivoId.trim() === '') {
    logger.warn('[SERVICIO_ENTRENADOR] Intento de crear relación con ID de entrenamiento cognitivo inválido: %s', entrenamientoCognitivoId);
    throwClientError('El ID del entrenamiento cognitivo es requerido y debe ser una cadena de texto no vacía.', 400);
  }

  // Validación de formato UUID
  const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  
  if (!UUID_REGEX.test(entrenadorId)) {
    logger.warn('[SERVICIO_ENTRENADOR] ID de entrenador no tiene formato UUID válido: %s', entrenadorId);
    throwClientError('El ID del entrenador debe tener formato UUID válido.', 400);
  }

  if (!UUID_REGEX.test(entrenamientoCognitivoId)) {
    logger.warn('[SERVICIO_ENTRENADOR] ID de entrenamiento cognitivo no tiene formato UUID válido: %s', entrenamientoCognitivoId);
    throwClientError('El ID del entrenamiento cognitivo debe tener formato UUID válido.', 400);
  }

  logger.info('[SERVICIO_ENTRENADOR] Creando relación entrenador-entrenamiento para entrenadorId: %s, entrenamientoCognitivoId: %s', entrenadorId, entrenamientoCognitivoId);
  
  try {
    const resultado = await entrenadorModel.crearEntrenadorEntrenamiento(entrenadorId.trim(), entrenamientoCognitivoId.trim());
    
    logger.info('[SERVICIO_ENTRENADOR] Relación entrenador-entrenamiento creada exitosamente con ID: %s', resultado.id);
    return { 
      success: true, 
      data: {
        relacionId: resultado.id,
        entrenadorId: resultado.entrenador,
        entrenamientoCognitivoId: resultado.entrenamientocognitivo
      },
      message: resultado.mensaje,
      statusCode: 201
    };
    
  } catch (error) {
    logger.error('[SERVICIO_ENTRENADOR] Error al crear relación entrenador-entrenamiento:', error);
    
    // Manejo de errores específicos de base de datos
    if (error.code === '23503') { // Foreign key violation
      const lowerCaseMessage = (error.message || '').toLowerCase();
      if (lowerCaseMessage.includes('entrenador')) {
        throwClientError('El ID del entrenador proporcionado no existe en la base de datos.', 404);
      } else if (lowerCaseMessage.includes('entrenamientocognitivo')) {
        throwClientError('El ID del entrenamiento cognitivo proporcionado no existe en la base de datos.', 404);
      } else {
        throwClientError('Uno de los IDs proporcionados no existe en la base de datos.', 404);
      }
    } else if (error.code === '23505') { // Unique constraint violation
      throwClientError('Ya existe una relación entre este entrenador y este entrenamiento cognitivo.', 409);
    }
    
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    throw error;
  }
}; 