import * as InformeService from '../services/informe.service.js';
import logger from '../config/logger.js';

/**
 * @file Controladores para las funcionalidades de informes de administración.
 */

/**
 * Controlador para obtener la lista de entrenamientos cognitivos para la vista de administración.
 * @async
 * @param {object} req - Objeto de petición Express.
 * @param {object} res - Objeto de respuesta Express.
 * @param {function} next - Función para pasar al siguiente middleware (para errores).
 */
export const obtenerListaEntrenamientosAdmin = async (req, res, next) => {
  logger.info('[CTRL_INFORME] Petición recibida para listar entrenamientos para administración.');
  try {
    const serviceResult = await InformeService.listarEntrenamientosParaAdmin(); 
    // El servicio devuelve un objeto con success y data
    logger.info(`[CTRL_INFORME] Lista de ${serviceResult.data.length} entrenamientos obtenida exitosamente del servicio.`);
    return res.status(200).json({
      message: 'Lista de entrenamientos obtenida exitosamente.',
      total: serviceResult.data.length,
      entrenamientos: serviceResult.data
    });
  } catch (error) {
    logger.error('[ERROR_CTRL_INFORME] Error en getListaEntrenamientosAdmin:', error);
    next(error); // Pasa el error al manejador de errores global
  }
};

/**
 * Controlador para obtener el detalle de las variables finalizadas para un entrenamiento específico.
 * @async
 * @param {object} req - Objeto de petición Express. (Contiene entrenamientoId en req.params)
 * @param {object} res - Objeto de respuesta Express.
 * @param {function} next - Función para pasar al siguiente middleware (para errores).
 */
export const obtenerDetalleInformeAdmin = async (req, res, next) => {
  const { entrenamientoId } = req.params;
  logger.info(`[CTRL_INFORME] Petición recibida para obtener detalle de informe para entrenamiento ID: ${entrenamientoId}`);

  try {
    const serviceResult = await InformeService.obtenerDetallesDeInformePorId(entrenamientoId); //

    logger.info(`[CTRL_INFORME] Detalle de informe para ID ${entrenamientoId} obtenido exitosamente del servicio (puede tener 0 elementos).`);
    return res.status(200).json({
      message: 'Detalle del informe obtenido exitosamente.',
      entrenamientoId: entrenamientoId, // Opcional, ya que está en la URL de la petición
      informe: serviceResult.data // Esto será un array, posiblemente vacío
    });
  } catch (error) {
    logger.error(`[ERROR_CTRL_INFORME] Error en getDetalleInformeAdmin para ID ${entrenamientoId}:`, error);
    next(error); // Pasa el error al manejador de errores global
  }
};


/**
 * Controlador para obtener la lista de entrenamientos asignados a un entrenador autenticado.
 * @async
 * @param {object} req - Objeto de petición Express. El ID del entrenador se toma del token.
 * @param {object} res - Objeto de respuesta Express.
 * @param {function} next - Función para pasar al siguiente middleware.
 */
export const obtenerListaEntrenamientosEntrenador = async (req, res, next) => {
  // El middleware verificarToken debe añadir la info del usuario (incluyendo el id) a req.user
  const entrenadorId = req.user.id; 
  logger.info(`[CTRL_INFORME] Petición recibida del entrenador ID: ${entrenadorId} para listar sus entrenamientos.`);
  try {
    const serviceResult = await InformeService.listarEntrenamientosEntrenador(entrenadorId);
    
    return res.status(200).json({
      message: 'Lista de entrenamientos asignados obtenida exitosamente.',
      total: serviceResult.data.length,
      entrenamientos: serviceResult.data
    });
  } catch (error) {
    logger.error('[ERROR_CTRL_INFORME] Error en obtenerListaEntrenamientosParaEntrenador:', error);
    next(error);
  }
};