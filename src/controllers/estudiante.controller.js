import * as EstudianteService from '../services/estudiante.service.js';
import logger from '../config/logger.js';
import { sendSuccess, handleControllerError } from '../utils/response.util.js';

/**
 * @file Contiene los controladores para la entidad Estudiante.
 */

/**
 * Controlador para registrar un nuevo estudiante.
 * Espera los datos del estudiante en el cuerpo de la solicitud (req.body),
 * incluyendo la sigla del tipo de documento, el nombre del género y los nombres de programas.
 * @async
 * @param {import('express').Request} req - Objeto de solicitud de Express.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - Función para pasar el control al siguiente middleware.
 */
export const registrarNuevoEstudianteController = async (req, res, next) => {
  logger.debug('[CONTROLADOR_ESTUDIANTE] Solicitud para registrar nuevo estudiante con datos:', req.body);
  
  try {
    const datosEstudiante = req.body;
    const resultadoServicio = await EstudianteService.registrarEstudiante(datosEstudiante);

    // Si el servicio tiene éxito, devuelve un objeto con los datos, incluyendo el mensaje de la BD
    return sendSuccess(res, 201, resultadoServicio.message || 'Estudiante registrado exitosamente.', {
      estudianteId: resultadoServicio.data.id,
      detalles: resultadoServicio.data.message // Mensaje de la función de BD
    });

  } catch (error) {
    logger.error('[CONTROLADOR_ESTUDIANTE] Error al procesar registro de estudiante:', error);
    handleControllerError(error, next, 'en registrarNuevoEstudianteController');
  }
};

/**
 * Controlador para modificar la información de un estudiante existente.
 * Identifica al estudiante por la sigla del tipo de documento y el número de documento proporcionados en la URL.
 * Los datos a actualizar se proporcionan en el cuerpo de la solicitud.
 * @async
 * @param {import('express').Request} req - Objeto de solicitud de Express.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - Función para pasar el control al siguiente middleware.
 */
export const modificarEstudianteController = async (req, res, next) => {
  const { siglaTipoDoc, numeroDoc } = req.params;
  const datosParaActualizar = req.body;
  logger.debug(`[CONTROLADOR_ESTUDIANTE] Solicitud para modificar estudiante: ${siglaTipoDoc}-${numeroDoc}`);
  
  try {
    const resultado = await EstudianteService.modificarEstudiante(siglaTipoDoc, numeroDoc, datosParaActualizar);

    // La función de BD devuelve un objeto con mensaje, estudianteid y detalles
    return sendSuccess(res, 200, resultado.mensaje, {
      estudianteId: resultado.estudianteid,
      detalles: resultado.detalles
    });

  } catch (error) {
    logger.error(`[CONTROLADOR_ESTUDIANTE] Error al modificar estudiante ${siglaTipoDoc}-${numeroDoc}:`, error);
    handleControllerError(error, next, 'en modificarEstudianteController');
  }
};

/**
 * Controlador para obtener la información completa de un estudiante por su documento.
 * @async
 * @param {import('express').Request} req - Objeto de solicitud de Express.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - Función para pasar el control al siguiente middleware.
 */
export const obtenerEstudianteController = async (req, res, next) => {
  const { siglaTipoDoc, numeroDoc } = req.params;
  logger.debug(`[CONTROLADOR_ESTUDIANTE] Solicitud para obtener estudiante: ${siglaTipoDoc}-${numeroDoc}`);

  try {
    const estudiante = await EstudianteService.obtenerEstudiantePorDocumento(siglaTipoDoc, numeroDoc);
    return sendSuccess(res, 200, 'Estudiante encontrado exitosamente.', estudiante);
  } catch (error) {
    logger.error(`[CONTROLADOR_ESTUDIANTE] Error al obtener estudiante ${siglaTipoDoc}-${numeroDoc}:`, error);
    handleControllerError(error, next, 'en obtenerEstudianteController');
  }
}; 



/**
 * Actualiza el género de un estudiante.
 * 
 * @async
 * @function
 * @param {import('express').Request} req - Objeto de solicitud de Express, debe contener el ID del estudiante en los parámetros y el nuevo nombre del género en el cuerpo.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - Función next de Express para manejo de errores.
 * @returns {Promise<void>} Envía una respuesta con el resultado de la actualización o pasa el error al middleware de manejo de errores.
 */
export const actualizarGeneroEstudiante = async (req, res, next) => {
  try {
    const { id } = req.params; 
    const { nuevoNombreGenero } = req.body;

    const resultado = await EstudianteService.actualizarGenero(
      id, 
      nuevoNombreGenero
    );

    sendSuccess(res, 200, resultado.mensaje, {
      estudianteId: resultado.estudianteid,
      generoId: resultado.generoactualizadoid,
    });

  } catch (error) {
    handleControllerError(error, next, 'en actualizarGeneroEstudiante');
  }
};