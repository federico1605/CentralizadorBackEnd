/**
 * @file Contiene funciones de utilidad para manejar respuestas HTTP consistentes.
 */

import logger from '../config/logger.js';

/**
 * Envía una respuesta de éxito estandarizada.
 * @param {object} res - Objeto de respuesta Express.
 * @param {number} statusCode - Código de estado HTTP para el éxito.
 * @param {string} message - Mensaje de éxito.
 * @param {*} [data=null] - Datos para incluir en la respuesta.
 */
export const sendSuccess = (res, statusCode, message, data = null) => {
  const response = {
    success: true,
    message,
  };

  if (data) {
    // Si data es un objeto, lo fusionamos con la respuesta.
    // Si no, lo asignamos a una propiedad 'data'.
    if (typeof data === 'object' && !Array.isArray(data) && data !== null) {
      Object.assign(response, data);
    } else {
      response.data = data;
    }
  }
  
  return res.status(statusCode).json(response);
};

/**
 * Envía una respuesta de error estandarizada.
 * @param {object} res - Objeto de respuesta Express.
 * @param {number} statusCode - Código de estado HTTP para el error.
 * @param {string} message - Mensaje de error.
 * @param {object} [errorDetails=null] - Detalles adicionales del error.
 */
export const sendError = (res, statusCode, message, errorDetails = null) => {
  const response = {
    success: false,
    message,
  };
  if (errorDetails) {
    response.error = errorDetails;
  }
  return res.status(statusCode).json(response);
};

/**
 * Manejador de errores para bloques catch en los controladores.
 * Centraliza el logging y pasa el error al siguiente middleware de error de Express.
 * @param {Error} error - El objeto de error capturado.
 * @param {function} next - La función next de Express.
 * @param {string} context - Una cadena que describe el contexto donde ocurrió el error (ej: 'en registrarEntrenador').
 */
export const handleControllerError = (error, next, context) => {
  logger.error(`[ERROR_CTRL] Error ${context}:`, error);
  next(error);
};

/**
 * Crea y lanza un error de cliente con un mensaje y código de estado.
 * Esta es una función de utilidad para ser usada principalmente en los servicios
 * para estandarizar los errores de negocio que se envían al controlador.
 * @param {string} message - El mensaje de error.
 * @param {number} statusCode - El código de estado HTTP.
 * @throws {Error} Lanza un error con las propiedades message y statusCode.
 */
export const throwClientError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
}; 