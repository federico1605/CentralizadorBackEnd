import * as UtilidadesService from '../services/utilidades.service.js';
import logger from '../config/logger.js';

/**
 * @file Contiene los controladores para funcionalidades de utilidad general.
 */

/**
 * Controlador para obtener la lista de todos los géneros.
 * @async
 * @param {import('express').Request} req - Objeto de solicitud de Express.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - Función para pasar el control al siguiente middleware.
 */
export const obtenerGenerosController = async (req, res, next) => {
  logger.debug('[CONTROLADOR_UTILIDADES] Solicitud para obtener todos los géneros.');
  try {
    const resultadoServicio = await UtilidadesService.listarTodosGenerosService();
    res.status(200).json(resultadoServicio);
  } catch (error) {
    logger.error('[CONTROLADOR_UTILIDADES] Error al obtener géneros:', error);
    next(error); 
  }
};

/**
 * Controlador para obtener la lista de todos los tipos de documento.
 * @async
 * @param {import('express').Request} req - Objeto de solicitud de Express.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - Función para pasar el control al siguiente middleware.
 */
export const obtenerTiposDocumentoController = async (req, res, next) => {
  logger.debug('[CONTROLADOR_UTILIDADES] Solicitud para obtener todos los tipos de documento.');
  try {
    const resultadoServicio = await UtilidadesService.listarTodosTiposDocumentoService();
    res.status(200).json(resultadoServicio);
  } catch (error) {
    logger.error('[CONTROLADOR_UTILIDADES] Error al obtener tipos de documento:', error);
    next(error); 
  }
};

/**
 * Controlador para obtener la lista de todos los programas.
 * @async
 * @param {import('express').Request} req - Objeto de solicitud de Express.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - Función para pasar el control al siguiente middleware.
 */
export const obtenerProgramasController = async (req, res, next) => {
  logger.debug('[CONTROLADOR_UTILIDADES] Solicitud para obtener todos los programas.');
  try {
    const resultadoServicio = await UtilidadesService.listarTodosProgramasService();
    res.status(200).json(resultadoServicio);
  } catch (error) {
    logger.error('[CONTROLADOR_UTILIDADES] Error al obtener programas:', error);
    next(error); 
  }
};

/**
 * Controlador para obtener la lista de todos los tipos de variables cognitivas.
 * @async
 * @param {import('express').Request} req - Objeto de solicitud de Express.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - Función para pasar el control al siguiente middleware.
 */
export const obtenerTiposVariablesCognitivasController = async (req, res, next) => {
  logger.debug('[CONTROLADOR_UTILIDADES] Solicitud para obtener todos los tipos de variables cognitivas.');
  try {
    const resultadoServicio = await UtilidadesService.listarTiposVariablesCognitivasService();
    res.status(200).json(resultadoServicio);
  } catch (error) {
    logger.error('[CONTROLADOR_UTILIDADES] Error al obtener tipos de variables cognitivas:', error);
    next(error); 
  }
};

/**
 * Controlador para obtener el ID de un estudiante por su tipo y número de documento.
 * Espera los parámetros `tipoDocumento` y `numeroDocumento` en la URL.
 * @async
 * @param {import('express').Request} req - Objeto de solicitud de Express. Se espera `req.params.tipoDocumento` y `req.params.numeroDocumento`.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - Función para pasar el control al siguiente middleware.
 */
export const obtenerIdEstudiantePorDocumentoController = async (req, res, next) => {
  const { tipoDocumento, numeroDocumento } = req.params;
  logger.debug(`[CONTROLADOR_UTILIDADES] Solicitud para obtener ID de estudiante: tipoDoc=${tipoDocumento}, numDoc=${numeroDocumento}`);

  try {
    const resultadoServicio = await UtilidadesService.obtenerIdEstudiantePorDocumentoService(tipoDocumento, numeroDocumento);

    if (!resultadoServicio.success) {
      return res.status(resultadoServicio.statusCode || 400).json({
        success: false,
        message: resultadoServicio.message,
      });
    }

    res.status(200).json({
      success: true,
      message: resultadoServicio.message,
      data: resultadoServicio.data,
    });
  } catch (error) {
    logger.error(`[CONTROLADOR_UTILIDADES] Error al obtener ID de estudiante por documento: ${error.message}`);
    next(error); // Pasa el error al manejador de errores global
  }
}; 