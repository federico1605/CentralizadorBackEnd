import { obtenerEstudiantesPorFacultad } from '../models/estudiantesEntrenamientos.model.js';
import logger from '../config/logger.js';
import * as EntrenamientoCognitivoService from '../services/entrenamientoCognitivo.service.js';
import { sendSuccess, handleControllerError } from '../utils/response.util.js';

// Expresión regular simple para una validación básica de formato UUID.
// Para una validación más completa y segura, considera usar una biblioteca como 'uuid'.
const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

/**
 * Manejador para obtener los estudiantes y sus datos de entrenamiento para una facultad específica.
 * Espera un parámetro 'facultadId' en la ruta, que debe ser un UUID válido.
 * @async
 * @param {import('express').Request} req Objeto de solicitud de Express. Se espera `req.params.facultadId`.
 * @param {import('express').Response} res Objeto de respuesta de Express.
 * @param {import('express').NextFunction} next Función para pasar el control al siguiente middleware/manejador de errores.
 */
export const obtenerEstudiantesPorFacultadController = async (req, res, next) => {
  const { facultadId } = req.params;

  // Validación del formato UUID para facultadId
  if (!facultadId || !UUID_REGEX.test(facultadId)) {
    logger.warn(`[CONTROLADOR_ESTUDIANTES_ENTRENAMIENTOS] Intento de acceso con ID de facultad inválido: ${facultadId}`);
    return res.status(400).json({
      success: false,
      message: 'El ID de la facultad proporcionado es inválido o no tiene el formato UUID correcto.',
    });
  }

  try {
    logger.info(`[CONTROLADOR_ESTUDIANTES_ENTRENAMIENTOS] Solicitando estudiantes para facultad ID: ${facultadId}`);
    const datos = await obtenerEstudiantesPorFacultad(facultadId);

    if (!datos || datos.length === 0) {
      logger.info(`[CONTROLADOR_ESTUDIANTES_ENTRENAMIENTOS] No se encontraron estudiantes para la facultad ID: ${facultadId}`);
      return res.status(200).json({ 
        success: true,
        message: `No se encontraron estudiantes para la facultad con ID ${facultadId}.`,
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      message: `Datos de estudiantes para la facultad ID ${facultadId} obtenidos correctamente.`,
      data: datos,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Manejador para obtener el detalle del entrenamiento cognitivo de un estudiante
 * por su tipo y número de documento proporcionados en el body.
 * @async
 * @param {import('express').Request} req Objeto de solicitud de Express. Se espera `req.body.tipoDocumento` y `req.body.numeroDocumento`.
 * @param {import('express').Response} res Objeto de respuesta de Express.
 * @param {import('express').NextFunction} next Función para pasar el control al siguiente middleware/manejador de errores.
 */
export const obtenerEntrenamientoEstudiantePorDocumentoController = async (req, res, next) => {
  const { tipoDocumento, numeroDocumento } = req.body;

  try {
    logger.info(`[CONTROLADOR_ENTRENAMIENTO] Solicitud para obtener entrenamiento por documento: tipoDoc=${tipoDocumento}, numDoc=${numeroDocumento}`);
    
    const resultadoServicio = await EntrenamientoCognitivoService.consultarEntrenamientoPorDocumento(tipoDocumento, numeroDocumento);

    if (!resultadoServicio.success) {
      return res.status(resultadoServicio.statusCode || 400).json({
        success: false,
        message: resultadoServicio.message,
      });
    }

    if (resultadoServicio.data && resultadoServicio.data.length === 0) {
      return res.status(200).json({ 
        success: true, 
        message: resultadoServicio.message || 'No se encontró ningún entrenamiento cognitivo para el estudiante especificado.',
        data: [], 
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Detalle(s) del entrenamiento cognitivo obtenidos correctamente.',
      data: resultadoServicio.data,
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Controlador para registrar un nuevo entrenamiento cognitivo.
 * Espera los datos del entrenamiento en el cuerpo de la solicitud (req.body).
 * @async
 * @param {import('express').Request} req - Objeto de solicitud de Express.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - Función para pasar el control al siguiente middleware.
 */
export const crearNuevoEntrenamientoCognitivoController = async (req, res, next) => {
  const {
    siglaTipoDocEstudiante,
    numeroDocEstudiante,
    siglaTipoDocEntrenador,
    numeroDocEntrenador,
    fechaFinEntrenamiento,
    variablesCognitivas,
  } = req.body;

  const datosEntrenamiento = {
    siglaTipoDocEstudiante,
    numeroDocEstudiante,
    siglaTipoDocEntrenador,
    numeroDocEntrenador,
    fechaFinEntrenamiento,
    variablesCognitivas,
  };

  logger.debug('[CONTROLADOR_ENTRENAMIENTO] Solicitud para crear nuevo entrenamiento cognitivo con datos:', datosEntrenamiento);

  try {
    const resultadoServicio = await EntrenamientoCognitivoService.crearNuevoEntrenamientoCognitivo(datosEntrenamiento);

    if (!resultadoServicio.success) {
      return res.status(resultadoServicio.statusCode || 400).json({
        success: false,
        message: resultadoServicio.message,
      });
    }

    res.status(201).json({
      success: true,
      message: resultadoServicio.message || 'Entrenamiento cognitivo registrado exitosamente.',
      data: {
        ...datosEntrenamiento, // Incluye todos los datos enviados en la solicitud
        id: resultadoServicio.data.id, // El ID del entrenamiento devuelto por la función de BD
        mensajeBD: resultadoServicio.data.message, // Mensaje adicional de la BD si lo hay
      },
    });

  } catch (error) {
    logger.error('[CONTROLADOR_ENTRENAMIENTO] Error al procesar registro de entrenamiento cognitivo:', error);
    next(error);
  }
};

/**
 * Controlador para registrar un nuevo entrenamiento y su asignación de variable inicial.
 * Espera los datos en el cuerpo de la solicitud (req.body).
 * @async
 * @param {import('express').Request} req - Objeto de solicitud de Express.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - Función para pasar el control al siguiente middleware.
 */
export const registrarEntrenamientoAsignacionController = async (req, res, next) => {
    const {
        estudianteId,
        fechaInicio,
        tiposVariablesCognitivasIds,
        nivelInicial,
        metricas,
    } = req.body;

    const datosAsignacion = {
        estudianteId,
        fechaInicio,
        tiposVariablesCognitivasIds,
        nivelInicial,
        metricas,
    };

    logger.debug('[CONTROLADOR_ENTRENAMIENTO] Solicitud para registrar asignación de entrenamiento con datos:', datosAsignacion);

    try {
        const resultadoServicio = await EntrenamientoCognitivoService.registrarNuevaAsignacionService(datosAsignacion);

        return res.status(resultadoServicio.statusCode || 500).json({
            success: resultadoServicio.success,
            message: resultadoServicio.message,
        });

    } catch (error) {
        logger.error('[CONTROLADOR_ENTRENAMIENTO] Error al procesar registro de asignación:', error);
        next(error);
    }
}; 

/**
 * Controlador para obtener el progreso detallado de una asignación de variable.
 * @async
 * @param {import('express').Request} req - Objeto de solicitud de Express. Se espera `asignacionId` en los params.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - Función para pasar el control al siguiente middleware.
 */
export const obtenerProgresoVariableController = async (req, res, next) => {
  const { asignacionId } = req.params;

  logger.info(`[CONTROLADOR_ENTRENAMIENTO] Solicitud para obtener progreso de asignación ID: ${asignacionId}`);

  try {
    const resultadoServicio = await EntrenamientoCognitivoService.consultarProgresoVariable(asignacionId);

    if (!resultadoServicio.success) {
      return res.status(resultadoServicio.statusCode || 400).json({
        success: false,
        message: resultadoServicio.message,
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Detalles de progreso obtenidos correctamente.',
      data: resultadoServicio.data,
    });

  } catch (error) {
    logger.error(`[CONTROLADOR_ENTRENAMIENTO] Error al obtener progreso de variable: ${error.message}`);
    next(error);
  }
};



/**
 * Controlador para actualizar la observación de una sesión de entrenamiento.
 * @async
 * @param {import('express').Request} req - Objeto de solicitud. Espera idSesion en params y nuevaObservacion en body.
 * @param {import('express').Response} res - Objeto de respuesta.
 * @param {import('express').NextFunction} next - Función para pasar al siguiente middleware de errores.
 */
export const actualizarObservacionSesionController = async (req, res, next) => {
  const { idSesion } = req.params;
  const { nuevaObservacion } = req.body;

  logger.info(`[CTRL_ENTRENAMIENTO] Petición para actualizar observación de sesión ID: ${idSesion}`);

  try {
    const resultadoServicio = await EntrenamientoCognitivoService.actualizarObservacionSesion(idSesion, nuevaObservacion);
    
    // El servicio ahora lanza errores, por lo que si llegamos aquí, fue un éxito.
    res.status(200).json({
      success: true,
      message: resultadoServicio.message,
      data: resultadoServicio.data
    });
  } catch (error) {
    next(error); // Pasamos el error al manejador global
  }
};

/**
 * Controlador para modificar un entrenamiento cognitivo existente.
 * Identifica al estudiante por su documento en la URL y toma los cambios del body.
 * @async
 * @param {import('express').Request} req - Objeto de solicitud de Express.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - Función para pasar el control al siguiente middleware.
 */
export const modificarEntrenamientoCognitivoController = async (req, res, next) => {
  const { siglaTipoDocEstudiante, numeroDocEstudiante } = req.params;
  const datosModificacion = req.body;

  logger.debug(`[CONTROLADOR_ENTRENAMIENTO] Solicitud para modificar entrenamiento de ${siglaTipoDocEstudiante}-${numeroDocEstudiante}`);

  try {
    const resultado = await EntrenamientoCognitivoService.modificarEntrenamientoCognitivo(
      siglaTipoDocEstudiante,
      numeroDocEstudiante,
      datosModificacion
    );

    return sendSuccess(res, 200, resultado.mensaje, {
      entrenamientoId: resultado.entrenamientocognitivoid,
      detalles: resultado.detalles,
    });

  } catch (error) {
    logger.error(`[CONTROLADOR_ENTRENAMIENTO] Error al modificar entrenamiento de ${siglaTipoDocEstudiante}-${numeroDocEstudiante}:`, error);
    handleControllerError(error, next, 'en modificarEntrenamientoCognitivoController');
  }
};

/**
 * Controlador para finalizar una sesión de entrenamiento.
 * @async
 * @param {import('express').Request} req - Objeto de solicitud. Espera idSesion en params y nuevasMetricas, nuevoNivelInicial en body.
 * @param {import('express').Response} res - Objeto de respuesta.
 * @param {import('express').NextFunction} next - Función para pasar al siguiente middleware de errores.
 */
export const finalizarSesionController = async (req, res, next) => {
  const { idSesion } = req.params;
  const { nuevasMetricas, nuevoNivelInicial } = req.body;

  logger.info(`[CTRL_ENTRENAMIENTO] Petición para finalizar sesión ID: ${idSesion}`);

  try {
    const resultadoServicio = await EntrenamientoCognitivoService.finalizarSesion(idSesion, nuevasMetricas, nuevoNivelInicial);
    
    res.status(200).json({
      success: true,
      message: resultadoServicio.mensaje,
      data: resultadoServicio.data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controlador para finalizar una asignación de variable cognitiva.
 * @async
 * @param {import('express').Request} req - Objeto de solicitud. Espera idAsignacion en params.
 * @param {import('express').Response} res - Objeto de respuesta.
 * @param {import('express').NextFunction} next - Función para pasar al siguiente middleware de errores.
 */
export const finalizarAsignacionVariableController = async (req, res, next) => {
  const { idAsignacion } = req.params;

  logger.info(`[CTRL_ENTRENAMIENTO] Petición para finalizar asignación de variable ID: ${idAsignacion}`);

  try {
    const resultadoServicio = await EntrenamientoCognitivoService.finalizarAsignacionVariable(idAsignacion);
    
    res.status(200).json({
      success: true,
      message: resultadoServicio.mensaje,
      data: resultadoServicio.data
    });
  } catch (error) {
    next(error);
  }
};