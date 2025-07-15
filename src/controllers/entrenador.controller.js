import * as entrenadorService from '../services/entrenador.service.js';
import logger from '../config/logger.js';


/**
 * @file Contiene los controladores para la entidad Entrenador.
 */

/**
 * Controlador para registrar un nuevo entrenador (Rol: Admin).
 * @async
 */
export const registrarEntrenador = async (req, res, next) => {
  logger.info('[CTRL_ENTRENADOR] Petición (de Admin) recibida para registrar nuevo entrenador.', { body: req.body });

  const { facultadNombres, siglaTipoDocumento, nombres, apellidos, numeroDocumento, correo, fechaFin } = req.body;

  try {
    const entrenadorData = {
      pSiglaTipoDocumento: siglaTipoDocumento,
      pNombres: nombres,
      pApellidos: apellidos,
      pNumeroDocumento: numeroDocumento,
      pCorreo: correo,
      pFacultadNombres: facultadNombres,
      pFechaFin: fechaFin ? fechaFin.toISOString().split('T')[0] : undefined,
    };

    const serviceResult = await entrenadorService.registrarEntrenador(entrenadorData);

    logger.info('[CTRL_ENTRENADOR] Entrenador registrado exitosamente (vía servicio).', { entrenadorId: serviceResult.data.identrenador });
    return res.status(201).json({
      message: serviceResult.data.mensaje || 'Entrenador registrado exitosamente.',
      entrenadorId: serviceResult.data.identrenador,
      details: serviceResult.data.detalles
    });
  } catch (error) {
    logger.error('[ERROR_CTRL_ENTRENADOR] Error en registrarEntrenador:', error);
    next(error);
  }
};

/**
 * Controlador para listar todos los entrenadores (Rol: Admin).
 * @async
 */
export const listarTodosLosEntrenadores = async (req, res, next) => {
  const { nombreFacultad } = req.query; 
  logger.info('[CTRL_ENTRENADOR] Petición (de Admin) para listar entrenadores recibida.', { query: req.query });

  try {
    const filtrosAplicar = {};
    if (nombreFacultad) {
      filtrosAplicar.nombreFacultad = nombreFacultad;
    }

    const serviceResult = await entrenadorService.obtenerListaCompletaEntrenadores(filtrosAplicar);

    logger.info(`[CTRL_ENTRENADOR] Listado de ${serviceResult.data.length} entrenadores obtenido exitosamente.`);
    return res.status(200).json({
      message: 'Lista de entrenadores obtenida exitosamente.',
      total: serviceResult.data.length,
      filtrosAplicados: filtrosAplicar,
      entrenadores: serviceResult.data
    });
  } catch (error) {
    logger.error('[ERROR_CTRL_ENTRENADOR] Error en listarTodosLosEntrenadores:', error);
    next(error);
  }
};

/**
 * Controlador para actualizar la información de un entrenador (Rol: Admin).
 * @async
 */
export const actualizarInformacionEntrenador = async (req, res, next) => {
  const { entrenadorID } = req.params; 
  logger.info(`[CTRL_ENTRENADOR] Petición (de Admin) recibida para actualizar entrenador ID: ${entrenadorID}`, { body: req.body });

  const { nuevosNombres, nuevosApellidos, nuevoCorreo, nuevaFechaFin, nuevosNombresFacultades } = req.body;

  const datosAActualizar = { 
    pNuevosNombres: nuevosNombres,
    pNuevosApellidos: nuevosApellidos,
    pNuevoCorreo: nuevoCorreo,
    pNuevaFechaFin: nuevaFechaFin,
    pNuevosNombresFacultades: nuevosNombresFacultades,
  };

  Object.keys(datosAActualizar).forEach(key => datosAActualizar[key] === undefined && delete datosAActualizar[key]);
  
  try {
    const serviceResult = await entrenadorService.modificarInformacionEntrenador(entrenadorID, datosAActualizar);

    logger.info('[CTRL_ENTRENADOR] Información de entrenador actualizada exitosamente.', { entrenadorId: serviceResult.data.entrenadorid });
    return res.status(200).json({
      message: serviceResult.data.mensaje || 'Información del entrenador actualizada.',
      entrenadorId: serviceResult.data.entrenadorid,
      details: serviceResult.data.detalles
    });
  } catch (error) {
    logger.error('[ERROR_CTRL_ENTRENADOR] Error en actualizarInformacionEntrenador:', error);
    next(error);
  }
};

/**
 * Controlador para desactivar un entrenador (Rol: Admin).
 * @async
 */
export const desactivarEntrenador = async (req, res, next) => {
  const { entrenadorID } = req.params;
  logger.info(`[CTRL_ENTRENADOR] Petición (de Admin) recibida para desactivar entrenador ID: ${entrenadorID}`);

  try {
    const serviceResult = await entrenadorService.desactivarEntrenador(entrenadorID);

    logger.info('[CTRL_ENTRENADOR] Entrenador desactivado exitosamente.', { entrenadorId: serviceResult.data.entrenadorId });
    return res.status(200).json({
      message: serviceResult.message,
      entrenadorId: serviceResult.data.entrenadorId
    });
  } catch (error) {
    logger.error('[ERROR_CTRL_ENTRENADOR] Error en desactivarEntrenador:', error);
    next(error);
  }
};




/**
 * Maneja la solicitud para obtener las facultades asociadas a un entrenador por su correo electrónico.
 * @async
 * @param {object} req - Objeto de solicitud de Express. Se espera `correo` en `req.params`.
 * @param {object} res - Objeto de respuesta de Express.
 * @returns {Promise<void>} Una promesa que resuelve cuando la respuesta ha sido enviada.
 */
export const obtenerFacultadesPorEmailController = async (req, res) => {
  const { correo } = req.params;

  logger.info('[CONTROLADOR_ENTRENADOR] Solicitud para obtener facultades del entrenador con correo: %s', correo);
  try {
    const facultades = await entrenadorService.obtenerFacultadesPorEmailService(correo);

    if (facultades.length === 0) {
      logger.info('[CONTROLADOR_ENTRENADOR] No se encontraron facultades para el correo: %s', correo);
      return res.status(404).json({ message: 'No se encontraron facultades para el entrenador con el correo proporcionado.' });
    }

    logger.info('[CONTROLADOR_ENTRENADOR] Facultades encontradas exitosamente para el correo: %s', correo);
    return res.status(200).json(facultades);
  } catch (error) {
    logger.error('[CONTROLADOR_ENTRENADOR] Error al obtener facultades por email:', error);
    // Manejo de errores específicos del servicio
    if (error.message === 'Correo electrónico inválido.') {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Error interno del servidor al obtener facultades.', error: error.message });
  }
}; 

/**
 * Controlador para obtener los datos de un entrenador por su correo electrónico.
 * @async
 * @param {object} req - Objeto de solicitud de Express. Se espera `correo` en `req.params`.
 * @param {object} res - Objeto de respuesta de Express.
 * @param {object} next - Función para pasar al siguiente middleware.
 * @returns {Promise<void>} Una promesa que resuelve cuando la respuesta ha sido enviada.
 */
export const obtenerDatosPorCorreoController = async (req, res, next) => {
  const { correo } = req.params;

  logger.info('[CONTROLADOR_ENTRENADOR] Solicitud para obtener datos de entrenador con correo: %s', correo);
  
  try {
    const resultado = await entrenadorService.obtenerDatosPorCorreoService(correo);

    logger.info('[CONTROLADOR_ENTRENADOR] Datos de entrenador obtenidos exitosamente para correo: %s', correo);
    return res.status(200).json({
      success: true,
      message: resultado.message,
      data: resultado.data
    });
    
  } catch (error) {
    logger.error('[CONTROLADOR_ENTRENADOR] Error al obtener datos de entrenador por correo:', error);
    next(error);
  }
}; 

/**
 * Controlador para crear una relación entre un entrenador y un entrenamiento cognitivo.
 * @async
 * @param {object} req - Objeto de solicitud de Express. Se espera `entrenadorId` y `entrenamientoCognitivoId` en `req.body`.
 * @param {object} res - Objeto de respuesta de Express.
 * @param {object} next - Función para pasar al siguiente middleware.
 * @returns {Promise<void>} Una promesa que resuelve cuando la respuesta ha sido enviada.
 */
export const crearEntrenadorEntrenamientoController = async (req, res, next) => {
  const { entrenadorId, entrenamientoCognitivoId } = req.body;

  logger.info('[CONTROLADOR_ENTRENADOR] Solicitud para crear relación entrenador-entrenamiento con entrenadorId: %s, entrenamientoCognitivoId: %s', entrenadorId, entrenamientoCognitivoId);
  
  try {
    const resultado = await entrenadorService.crearEntrenadorEntrenamientoService(entrenadorId, entrenamientoCognitivoId);

    if (!resultado.success) {
      return res.status(resultado.statusCode || 400).json({
        success: false,
        message: resultado.message,
      });
    }

    logger.info('[CONTROLADOR_ENTRENADOR] Relación entrenador-entrenamiento creada exitosamente con ID: %s', resultado.data.relacionId);
    return res.status(201).json({
      success: true,
      message: resultado.message,
      data: resultado.data
    });
    
  } catch (error) {
    logger.error('[CONTROLADOR_ENTRENADOR] Error al crear relación entrenador-entrenamiento:', error);
    next(error);
  }
}; 