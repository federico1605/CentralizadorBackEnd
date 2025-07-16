import * as EntrenamientoModel from '../models/estudiantesEntrenamientos.model.js'; 
import logger from '../config/logger.js';
import { throwClientError } from '../utils/response.util.js';

/**
 * @file Contiene los servicios relacionados con los Entrenamientos Cognitivos.
 */

/**
 * @typedef {import('../models/estudiantesEntrenamientos.model.js').EntrenamientoCognitivoDetalle} EntrenamientoCognitivoDetalle
 * @typedef {import('../models/estudiantesEntrenamientos.model.js').CrearEntrenamientoCognitivoDataDB} CrearEntrenamientoCognitivoDataDB
 */

/**
 * Valida si una cadena es una fecha y hora válida en formato YYYY-MM-DD HH:MM:SS.
 * @param {string} dateTimeString
 * @returns {boolean}
 */
function isValidDateTimeString(dateTimeString) {
    if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateTimeString)) {
        return false;
    }
    const date = new Date(dateTimeString);
    return !isNaN(date.getTime());
}

/**
 * Valida los datos de entrada para crear un nuevo entrenamiento cognitivo.
 * @param {object} datosEntrada - Datos del entrenamiento a validar.
 * @returns {object|null} Objeto de error si hay validaciones fallidas, null si todo está bien.
 */
function validarDatosCrearEntrenamiento(datosEntrada) {
  const {
    siglaTipoDocEstudiante,
    numeroDocEstudiante,
    siglaTipoDocEntrenador,
    numeroDocEntrenador,
    fechaFinEntrenamiento,
    variablesCognitivas,
  } = datosEntrada;

  if (!siglaTipoDocEstudiante || typeof siglaTipoDocEstudiante !== 'string' || siglaTipoDocEstudiante.trim() === '') {
    return { success: false, message: 'La sigla del tipo de documento del estudiante es requerida.', statusCode: 400 };
  }
  if (!numeroDocEstudiante || typeof numeroDocEstudiante !== 'string' || numeroDocEstudiante.trim() === '') {
    return { success: false, message: 'El número de documento del estudiante es requerido.', statusCode: 400 };
  }
  if (!siglaTipoDocEntrenador || typeof siglaTipoDocEntrenador !== 'string' || siglaTipoDocEntrenador.trim() === '') {
    return { success: false, message: 'La sigla del tipo de documento del entrenador es requerida.', statusCode: 400 };
  }
  if (!numeroDocEntrenador || typeof numeroDocEntrenador !== 'string' || numeroDocEntrenador.trim() === '') {
    return { success: false, message: 'El número de documento del entrenador es requerido.', statusCode: 400 };
  }
  if (fechaFinEntrenamiento && !isValidDateTimeString(fechaFinEntrenamiento)) {
    return { success: false, message: 'La fecha de fin del entrenamiento debe estar en formato YYYY-MM-DD HH:MM:SS.', statusCode: 400 };
  }
  if (!Array.isArray(variablesCognitivas) || variablesCognitivas.length === 0) {
    return { success: false, message: 'Se debe especificar al menos una variable cognitiva.', statusCode: 400 };
  }
  if (variablesCognitivas.some(v => typeof v !== 'string' || v.trim() === '')) {
    return { success: false, message: 'Las variables cognitivas deben ser cadenas de texto no vacías.', statusCode: 400 };
  }
  
  return null; // No hay errores de validación
}

/**
 * Prepara los datos del entrenamiento para la base de datos.
 * @param {object} datosEntrada - Datos del entrenamiento validados.
 * @returns {object} Datos formateados para la base de datos.
 */
function prepararDatosEntrenamientoParaDB(datosEntrada) {
  const {
    siglaTipoDocEstudiante,
    numeroDocEstudiante,
    siglaTipoDocEntrenador,
    numeroDocEntrenador,
    fechaFinEntrenamiento,
    variablesCognitivas,
  } = datosEntrada;

  return {
    pSiglaTipoDocEstudiante: siglaTipoDocEstudiante.trim(),
    pNumeroDocEstudiante: numeroDocEstudiante.trim(),
    pSiglaTipoDocEntrenador: siglaTipoDocEntrenador.trim(),
    pNumeroDocEntrenador: numeroDocEntrenador.trim(),
    pVariablesCognitivas: variablesCognitivas.map(v => v.trim()),
    pFechaFinEntrenamiento: fechaFinEntrenamiento,
  };
}

/**
 * Maneja la respuesta de la base de datos para la creación de entrenamiento.
 * @param {object} resultado - Resultado de la operación en la base de datos.
 * @param {string} resultado.entrenamientoId - ID del entrenamiento creado.
 * @param {string} resultado.mensaje - Mensaje de la operación.
 * @param {object} resultado.detalles - Detalles adicionales.
 * @returns {object} Respuesta formateada para el cliente.
 */
function manejarRespuestaCrearEntrenamiento(resultado) {
  const { entrenamientoId, mensaje, detalles } = resultado;

  // Verificar el mensaje de éxito de la BD
  if (mensaje && mensaje.includes('exitosamente')) {
    logger.info(`[SERVICIO_ENTRENAMIENTO] Entrenamiento cognitivo creado exitosamente con ID: ${entrenamientoId || 'N/A'}`);
    return {
      success: true,
      data: { id: entrenamientoId, message: mensaje, detalles: detalles },
      message: mensaje,
      statusCode: 201
    };
  }

  logger.warn(`[SERVICIO_ENTRENAMIENTO] Error controlado desde BD al crear entrenamiento: ${mensaje || 'Mensaje de error desconocido.'}`);
  let statusCode = 400;
  if (mensaje && mensaje.includes('ya tiene un entrenamiento')) {
    statusCode = 409;
  } else if (mensaje && mensaje.includes('Error')) {
    statusCode = 400;
  }
  return { success: false, message: mensaje, statusCode: statusCode };
}

/**
 * Valida los datos de entrada para modificar un entrenamiento cognitivo.
 * @param {object} datosModificacion - Datos de modificación a validar.
 * @throws {Error} Si hay errores de validación.
 */
function validarDatosModificarEntrenamiento(datosModificacion) {
  const {
    siglaTipoDocNuevoEntrenador,
    numeroDocNuevoEntrenador,
    variablesAAgregar,
    variablesARemover,
  } = datosModificacion;

  // Validación de parámetros de entrenador
  if ((siglaTipoDocNuevoEntrenador && !numeroDocNuevoEntrenador) || (!siglaTipoDocNuevoEntrenador && numeroDocNuevoEntrenador)) {
    throwClientError('Para cambiar el entrenador, se deben proporcionar tanto la sigla del tipo de documento como el número de documento del nuevo entrenador.', 400);
  }

  // Validación de arrays
  if (variablesAAgregar && !Array.isArray(variablesAAgregar)) {
    throwClientError('El campo "variablesAAgregar" debe ser un arreglo.', 400);
  }
  if (variablesARemover && !Array.isArray(variablesARemover)) {
    throwClientError('El campo "variablesARemover" debe ser un arreglo.', 400);
  }
}

/**
 * Prepara los datos para la modificación en la base de datos.
 * @param {string} siglaTipoDocEstudiante - Sigla del tipo de documento del estudiante.
 * @param {string} numeroDocEstudiante - Número de documento del estudiante.
 * @param {object} datosModificacion - Datos de modificación.
 * @returns {object} Datos formateados para la base de datos.
 */
function prepararDatosModificacionParaDB(siglaTipoDocEstudiante, numeroDocEstudiante, datosModificacion) {
  const {
    variablesAAgregar,
    variablesARemover,
    siglaTipoDocNuevoEntrenador,
    numeroDocNuevoEntrenador,
    nuevaFechaFinEntrenamiento,
  } = datosModificacion;

  return {
    pSiglaTipoDocEstudiante: siglaTipoDocEstudiante,
    pNumeroDocEstudiante: numeroDocEstudiante,
    pVariablesAAgregar: variablesAAgregar || null,
    pVariablesARemover: variablesARemover || null,
    pSiglaTipoDocNuevoEntrenador: siglaTipoDocNuevoEntrenador || null,
    pNumeroDocNuevoEntrenador: numeroDocNuevoEntrenador || null,
    pNuevaFechaFinEntrenamiento: nuevaFechaFinEntrenamiento || null,
  };
}

/**
 * Maneja la respuesta de la base de datos para la modificación de entrenamiento.
 * @param {object} resultadoDB - Resultado de la operación en la base de datos.
 * @param {string} siglaTipoDocEstudiante - Sigla del tipo de documento del estudiante.
 * @param {string} numeroDocEstudiante - Número de documento del estudiante.
 * @returns {object} Resultado de la operación.
 * @throws {Error} Si hay errores de negocio.
 */
function manejarRespuestaModificarEntrenamiento(resultadoDB, siglaTipoDocEstudiante, numeroDocEstudiante) {
  // La función de BD es robusta y puede devolver mensajes de error controlados
  // en lugar de lanzar excepciones SQL para ciertos casos. Los identificamos aquí.
  if (resultadoDB.mensaje && !resultadoDB.mensaje.toLowerCase().includes('exitosamente')) {
    logger.warn(`[SERVICIO_ENTRENAMIENTO] La BD devolvió un mensaje de error controlado: ${resultadoDB.mensaje}`);
    // Asumimos 400 como un error de validación de negocio general. 
    // Si el mensaje indica un conflicto (ej. "ya existe"), podría ser 409.
    let statusCode = 400;
    if (resultadoDB.mensaje.toLowerCase().includes('no tiene un entrenamiento')) {
      statusCode = 404; // Not Found
    }
    throwClientError(resultadoDB.mensaje, statusCode);
  }
  
  logger.info(`[SERVICIO_ENTRENAMIENTO] Entrenamiento de ${siglaTipoDocEstudiante}-${numeroDocEstudiante} modificado exitosamente.`);
  return resultadoDB;
}

/**
 * Servicio para consultar el detalle del entrenamiento cognitivo de un estudiante por su tipo y número de documento.
 * @async
 * @param {string} tipoDocumento - Sigla del tipo de documento.
 * @param {string} numeroDocumento - Número de documento del estudiante.
 * @returns {Promise<{success: boolean, data?: EntrenamientoCognitivoDetalle[], message?: string}>}
 *          Objeto indicando éxito y los datos del entrenamiento (un array), o un mensaje de error.
 * @throws {Error} Si ocurren errores inesperados o de validación que deben ser manejados por un middleware de errores.
 */
export const consultarEntrenamientoPorDocumento = async (tipoDocumento, numeroDocumento) => {
  logger.debug(`[SERVICIO_ENTRENAMIENTO] Solicitud para consultar entrenamiento por documento: tipoDoc=${tipoDocumento}, numDoc=${numeroDocumento}`);

  if (!tipoDocumento || typeof tipoDocumento !== 'string' || tipoDocumento.trim() === '') {
    logger.warn('[SERVICIO_ENTRENAMIENTO] Intento de consulta con tipoDocumento inválido o ausente.');
    return { success: false, message: 'El tipo de documento es requerido y debe ser una cadena de texto no vacía.', statusCode: 400 };
  }
  if (!numeroDocumento || typeof numeroDocumento !== 'string' || numeroDocumento.trim() === '') {
    logger.warn('[SERVICIO_ENTRENAMIENTO] Intento de consulta con numeroDocumento inválido o ausente.');
    return { success: false, message: 'El número de documento es requerido y debe ser una cadena de texto no vacía.', statusCode: 400 };
  }

  try {
    const entrenamientos = await EntrenamientoModel.obtenerEntrenamientoCognitivoPorDocumento(tipoDocumento.trim(), numeroDocumento.trim());

    if (entrenamientos.length === 0) {
      logger.info(`[SERVICIO_ENTRENAMIENTO] No se encontró ningún entrenamiento para tipoDoc=${tipoDocumento}, numDoc=${numeroDocumento}.`);
      return { success: true, data: [], message: 'No se encontró ningún entrenamiento cognitivo para el estudiante especificado.' };
    }

    logger.info(`[SERVICIO_ENTRENAMIENTO] ${entrenamientos.length} entrenamientos encontrados para tipoDoc=${tipoDocumento}, numDoc=${numeroDocumento}.`);
    return { success: true, data: entrenamientos }; 
  } catch (error) {
    logger.error(`[SERVICIO_ENTRENAMIENTO] Error en el servicio al consultar entrenamiento por documento: ${error.message}`);
    if (!error.statusCode) {
        error.statusCode = 500; 
    }
    throw error; 
  }
};

/**
 * Servicio para registrar un nuevo entrenamiento cognitivo completo.
 * Valida los datos y delega la inserción a la función de base de datos CC.CrearEntrenamientoCognitivoUFT.
 * Esta función crea el entrenamiento, asigna el entrenador y las variables cognitivas en una sola operación.
 * @async
 * @param {object} datosEntrada - Datos del entrenamiento provenientes del controlador.
 * @param {string} datosEntrada.siglaTipoDocEstudiante - Sigla del tipo de documento del estudiante.
 * @param {string} datosEntrada.numeroDocEstudiante - Número de documento del estudiante.
 * @param {string} datosEntrada.siglaTipoDocEntrenador - Sigla del tipo de documento del entrenador.
 * @param {string} datosEntrada.numeroDocEntrenador - Número de documento del entrenador.
 * @param {string} datosEntrada.fechaFinEntrenamiento - Fecha y hora de fin del entrenamiento (YYYY-MM-DD HH:MM:SS).
 * @param {string[]} datosEntrada.variablesCognitivas - Array de nombres de variables cognitivas.
 * @returns {Promise<{success: boolean, data?: object, message?: string, statusCode?: number}>}
 *          Objeto indicando éxito y los datos del entrenamiento creado (incluyendo ID), o un mensaje de error.
 * @throws {Error} Si ocurre un error inesperado.
 */
export const crearNuevoEntrenamientoCognitivo = async (datosEntrada) => {
  logger.debug('[SERVICIO_ENTRENAMIENTO] Solicitud para crear nuevo entrenamiento cognitivo:', datosEntrada);

  try {
    // Validar datos de entrada
    const errorValidacion = validarDatosCrearEntrenamiento(datosEntrada);
    if (errorValidacion) {
      return errorValidacion;
    }

    // Preparar datos para la base de datos
    const datosEntrenamientoParaDB = prepararDatosEntrenamientoParaDB(datosEntrada);

    // Ejecutar operación en la base de datos
    const resultado = await EntrenamientoModel.crearEntrenamientoCognitivoDB(datosEntrenamientoParaDB);
    
    // Manejar respuesta de la base de datos
    return manejarRespuestaCrearEntrenamiento(resultado);

  } catch (error) {
    logger.error('[SERVICIO_ENTRENAMIENTO] Error inesperado en el servicio al crear entrenamiento cognitivo:', error);
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    throw error;
  }
};

/**
 * Valida si una cadena es un UUID válido.
 * @param {string} uuid - La cadena a validar.
 * @returns {boolean}
 */
function isValidUUID(uuid) {
    const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    return typeof uuid === 'string' && UUID_REGEX.test(uuid);
}

/**
 * Servicio para registrar un nuevo entrenamiento y su asignación de variable inicial.
 * @async
 * @param {object} datosAsignacion - Datos para el registro.
 * @param {string} datosAsignacion.estudianteId
 * @param {string} datosAsignacion.fechaInicio
 * @param {string[]} datosAsignacion.tiposVariablesCognitivasIds - Array de UUIDs.
 * @param {object} datosAsignacion.nivelInicial
 * @param {object} datosAsignacion.metricas
 * @returns {Promise<{success: boolean, message: string, statusCode?: number}>}
 */
export const registrarNuevaAsignacionService = async (datosAsignacion) => {
    const {
        estudianteId,
        fechaInicio,
        tiposVariablesCognitivasIds,
        nivelInicial,
        metricas,
    } = datosAsignacion;

    logger.debug('[SERVICIO_ENTRENAMIENTO] Solicitud para registrar nueva asignación:', datosAsignacion);

    // --- Validaciones ---
    if (!isValidUUID(estudianteId)) {
        return { success: false, message: 'El ID del estudiante es requerido y debe ser un UUID válido.', statusCode: 400 };
    }
    if (!Array.isArray(tiposVariablesCognitivasIds) || tiposVariablesCognitivasIds.length === 0) {
        return { success: false, message: 'Se debe proporcionar al menos un ID de tipo de variable cognitiva en un arreglo.', statusCode: 400 };
    }
    for (const id of tiposVariablesCognitivasIds) {
        if (!isValidUUID(id)) {
            return { success: false, message: `El ID de tipo de variable cognitiva '${id}' no es un UUID válido.`, statusCode: 400 };
        }
    }
    if (!fechaInicio || !isValidDateTimeString(fechaInicio)) { // Reusando validador existente
        return { success: false, message: 'La fecha de inicio es requerida y debe estar en formato YYYY-MM-DD HH:MM:SS.', statusCode: 400 };
    }
    if (nivelInicial === null || typeof nivelInicial !== 'object' || Array.isArray(nivelInicial)) {
        return { success: false, message: 'El nivel inicial es requerido y debe ser un objeto JSON.', statusCode: 400 };
    }
    if (metricas === null || typeof metricas !== 'object' || Array.isArray(metricas)) {
        return { success: false, message: 'Las métricas son requeridas y deben ser un objeto JSON.', statusCode: 400 };
    }

    try {
        const datosParaDB = {
            pEstudianteId: estudianteId,
            pFechaInicio: fechaInicio,
            pTiposVariablesCognitivasIds: tiposVariablesCognitivasIds,
            pNivelInicial: nivelInicial,
            pMetricas: metricas,
        };

        const mensajeDB = await EntrenamientoModel.registrarEntrenamientoAsignacionDB(datosParaDB);

        if (mensajeDB && mensajeDB.includes('éxito')) {
             logger.info(`[SERVICIO_ENTRENAMIENTO] Asignación registrada exitosamente. Mensaje DB: ${mensajeDB}`);
            return {
                success: true,
                message: mensajeDB,
                statusCode: 201
            };
        }

        logger.warn(`[SERVICIO_ENTRENAMIENTO] Error controlado desde BD al registrar asignación: ${mensajeDB || 'Mensaje de error desconocido.'}`);
        return { success: false, message: mensajeDB || 'Ocurrió un error en la base de datos.', statusCode: 400 };

    } catch (error) {
        logger.error('[SERVICIO_ENTRENAMIENTO] Error inesperado en el servicio al registrar asignación:', error);
        throw error;
    }
}; 


/**
 * Servicio para consultar el progreso detallado de una asignación de variable.
 * @async
 * @param {string} asignacionVariableId - El UUID de la asignación de variable.
 * @returns {Promise<{success: boolean, data?: object, message?: string, statusCode?: number}>}
 * Objeto indicando éxito y los datos del progreso, o un mensaje de error.
 * @throws {Error} Si ocurren errores inesperados.
 */
export const consultarProgresoVariable = async (asignacionVariableId) => {
  // Aquí podrías añadir una validación de formato UUID si lo deseas
  if (!asignacionVariableId) {
    return { success: false, message: 'El ID de la asignación de variable es requerido.', statusCode: 400 };
  }

  logger.debug(`[SERVICIO_ENTRENAMIENTO] Solicitud para consultar progreso de asignación ID: ${asignacionVariableId}`);

  try {
    const progreso = await EntrenamientoModel.obtenerProgresoVariablePorId(asignacionVariableId);

    if (!progreso) {
      logger.warn(`[SERVICIO_ENTRENAMIENTO] No se encontró progreso para la asignación ID ${asignacionVariableId}`);
      return { success: false, message: 'No se encontraron detalles de progreso para el ID proporcionado.', statusCode: 404 };
    }

    logger.info(`[SERVICIO_ENTRENAMIENTO] Progreso para asignación ID ${asignacionVariableId} obtenido exitosamente.`);
    return { success: true, data: progreso };
    
  } catch (error) {
    logger.error(`[SERVICIO_ENTRENAMIENTO] Error en servicio al consultar progreso de variable: ${error.message}`);
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    throw error;
  }
};


/**
 * Servicio para actualizar la observación de una sesión de entrenamiento.
 * @async
 * @param {string} idSesion - El UUID de la sesión.
 * @param {string} nuevaObservacion - El nuevo texto para la observación.
 * @returns {Promise<{success: boolean, data?: object, message?: string}>} Objeto indicando el resultado.
 * @throws {Error} Lanza un error con statusCode si la validación falla o si el modelo falla.
 */
export const actualizarObservacionSesion = async (idSesion, nuevaObservacion) => {
  logger.debug(`[SERVICIO_ENTRENAMIENTO] Solicitud para actualizar observación de sesión ID: ${idSesion}`);

  if (typeof nuevaObservacion !== 'string') {
    return { success: false, message: 'La observación debe ser una cadena de texto.', statusCode: 400 };
  }

  try {
    const resultadoDB = await EntrenamientoModel.actualizarObservacionSesionDB(idSesion, nuevaObservacion);
    
    
    // Si la función de BD lanza una excepción, el catch de abajo la manejará.
    if (resultadoDB && resultadoDB.sesionid) {
       return { success: true, data: resultadoDB, message: resultadoDB.mensaje };
    }
    
    // Si la BD devolvió un error controlado como un mensaje en la fila.
    const errorMessage = resultadoDB ? resultadoDB.mensaje : 'No se pudo actualizar la observación.';
    throw Object.assign(new Error(errorMessage), { statusCode: 400 });

  } catch (error) {
    logger.error(`[SERVICIO_ENTRENAMIENTO] Error en servicio al actualizar observación de sesión: ${error.message}`);
    if (!error.statusCode) {
      error.statusCode = 400; 
    }
    throw error;
  }
};

/**
 * @typedef {import('../models/estudiantesEntrenamientos.model.js').ResultadoModificacionEntrenamiento} ResultadoModificacionEntrenamiento
 */

/**
 * Servicio para modificar un entrenamiento cognitivo existente.
 * Aplica lógica de negocio y validaciones antes de llamar al modelo.
 * @async
 * @param {string} siglaTipoDocEstudiante - Sigla del tipo de documento del estudiante.
 * @param {string} numeroDocEstudiante - Número de documento del estudiante.
 * @param {object} datosModificacion - Objeto con los datos a actualizar.
 * @returns {Promise<ResultadoModificacionEntrenamiento>} El resultado de la operación.
 * @throws {Error} Lanza un error con statusCode para ser manejado por el controlador.
 */
export const modificarEntrenamientoCognitivo = async (siglaTipoDocEstudiante, numeroDocEstudiante, datosModificacion) => {
  logger.debug(`[SERVICIO_ENTRENAMIENTO] Solicitud para modificar entrenamiento de ${siglaTipoDocEstudiante}-${numeroDocEstudiante} con datos:`, datosModificacion);

  try {
    // Validar datos de entrada
    validarDatosModificarEntrenamiento(datosModificacion);

    // Preparar datos para la base de datos
    const datosParaDB = prepararDatosModificacionParaDB(siglaTipoDocEstudiante, numeroDocEstudiante, datosModificacion);

    // Ejecutar operación en la base de datos
    const resultadoDB = await EntrenamientoModel.modificarEntrenamientoCognitivoDB(datosParaDB);
    
    // Manejar respuesta de la base de datos
    return manejarRespuestaModificarEntrenamiento(resultadoDB, siglaTipoDocEstudiante, numeroDocEstudiante);

  } catch (error) {
    logger.error(`[SERVICIO_ENTRENAMIENTO] Error en el servicio al modificar entrenamiento: ${error.message}`);

    if (error.statusCode) {
      throw error;
    }

    // Si el error tiene el código 'P0001', es un RAISE EXCEPTION de la BD
    if (error.code === 'P0001') {
      // Lanzamos un error de cliente (400) con el mensaje exacto de la base de datos.
      throwClientError(error.message, 400);
    }

    // Para cualquier otro tipo de error (problemas de conexión, etc.), lanzamos un error 500 genérico.
    const serverError = new Error('Ocurrió un error inesperado en el servidor al intentar modificar el entrenamiento.');
    serverError.statusCode = 500;
    throw serverError;
  }
};



/**
 * Servicio para crear una nueva sesión de entrenamiento.
 * @param {object} datos - Datos para crear la sesión.
 * @returns {Promise<object>} El resultado de la operación.
 * @throws {Error} Lanza un error con statusCode para ser manejado por el controlador.
 */
export const crearNuevaSesion = async (datos) => {
  const { siglaTipoDocEstudiante, numeroDocEstudiante, nombreVariableCognitiva, fechaInicio } = datos;
  logger.debug('[SERVICIO_ENTRENAMIENTO] Petición para crear nueva sesión con datos:', datos);

  try {
    
    if (!siglaTipoDocEstudiante || !numeroDocEstudiante || !nombreVariableCognitiva) {
      throwClientError('Se requieren los datos del estudiante y el nombre de la variable.', 400);
    }

    
    const resultadoDB = await EntrenamientoModel.crearSesionDB({
        pSiglaTipoDocEstudiante: siglaTipoDocEstudiante,
        pNumeroDocEstudiante: numeroDocEstudiante,
        pNombreVariableCognitiva: nombreVariableCognitiva,
        pFechaInicio: fechaInicio || new Date(), // Si no se provee fecha, usa la actual
        pObservacion: '' // Observación inicial vacía
    });

    
    if (!resultadoDB || !resultadoDB.sesionentrenamientoid) {
      // Si la función de BD devolvió un error controlado en el campo 'mensaje'
      throwClientError(resultadoDB?.mensaje || 'Error al crear la sesión en la base de datos.', 400);
    }
    
   
    logger.info(`[SERVICIO_ENTRENAMIENTO] Sesión creada exitosamente con ID: ${resultadoDB.sesionentrenamientoid}`);
    return { mensaje: 'Sesión creada exitosamente', data: resultadoDB };

  } catch (error) {
    logger.error('[SERVICIO_ENTRENAMIENTO] Error en servicio al crear sesión:', error);
    // Si el error no tiene ya un statusCode (lanzado por throwClientError), es un error inesperado.
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    throw error; // Relanzar para que el controlador lo maneje.
  }
};


/**
 * Servicio para iniciar una sesión de entrenamiento.
 * @param {string} idSesion - El UUID de la sesión a iniciar.
 * @returns {Promise<object>} El resultado de la operación.
 * @throws {Error} Lanza un error con statusCode para ser manejado por el controlador.
 */
export const iniciarSesion = async (idSesion) => {
  logger.debug(`[SERVICIO_ENTRENAMIENTO] Petición para iniciar sesión ID: ${idSesion}`);

  try {
    
    const resultadoDB = await EntrenamientoModel.iniciarSesionDB(idSesion);

    
    if (!resultadoDB || !resultadoDB.exito) {
        // La función de la BD devuelve un mensaje de error específico que podemos usar.
        throwClientError(resultadoDB?.mensaje || 'No se pudo iniciar la sesión.', 400);
    }

    
    logger.info(`[SERVICIO_ENTRENAMIENTO] Sesión ID: ${idSesion} iniciada correctamente.`);
    return { mensaje: 'Sesión iniciada correctamente', data: resultadoDB };
    
  } catch (error) {
    logger.error(`[SERVICIO_ENTRENAMIENTO] Error en servicio al iniciar sesión:`, error);
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    throw error; // Relanzar
  }
};

/**
 * Servicio para finalizar una sesión de entrenamiento.
 * @param {string} idSesion - El UUID de la sesión a finalizar.
 * @param {object} nuevasMetricas - Objeto JSON con las nuevas métricas.
 * @param {object} nuevoNivelInicial - Objeto JSON con el nuevo nivel inicial.
 * @returns {Promise<object>} El resultado de la operación.
 * @throws {Error} Lanza un error con statusCode para ser manejado por el controlador.
 */
export const finalizarSesion = async (idSesion, nuevasMetricas, nuevoNivelInicial) => {
  logger.debug(`[SERVICIO_ENTRENAMIENTO] Petición para finalizar sesión ID: ${idSesion}`);

  try {
    // Validaciones básicas
    if (!idSesion || !isValidUUID(idSesion)) {
      throwClientError('El ID de la sesión es requerido y debe ser un UUID válido.', 400);
    }

    if (!nuevasMetricas || typeof nuevasMetricas !== 'object' || Array.isArray(nuevasMetricas)) {
      throwClientError('Las nuevas métricas son requeridas y deben ser un objeto JSON válido.', 400);
    }

    if (!nuevoNivelInicial || typeof nuevoNivelInicial !== 'object' || Array.isArray(nuevoNivelInicial)) {
      throwClientError('El nuevo nivel inicial es requerido y debe ser un objeto JSON válido.', 400);
    }
    
    const resultadoDB = await EntrenamientoModel.finalizarSesionDB(idSesion, nuevasMetricas, nuevoNivelInicial);

    // Verificar si la operación fue exitosa
    if (!resultadoDB || !resultadoDB.mensaje) {
      throwClientError('Error al finalizar la sesión en la base de datos.', 500);
    }

    // Si el mensaje contiene "Error" significa que hubo un problema controlado
    if (resultadoDB.mensaje.includes('Error') || resultadoDB.mensaje.includes('error')) {
      throwClientError(resultadoDB.mensaje, 400);
    }

    logger.info(`[SERVICIO_ENTRENAMIENTO] Sesión ID: ${idSesion} finalizada correctamente.`);
    return { 
      mensaje: resultadoDB.mensaje, 
      data: {
        idSesion: resultadoDB.idsesion,
        detalles: resultadoDB.detalles
      }
    };
    
  } catch (error) {
    logger.error(`[SERVICIO_ENTRENAMIENTO] Error en servicio al finalizar sesión:`, error);
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    throw error;
  }
};

/**
 * Servicio para finalizar una asignación de variable cognitiva.
 * @param {string} idAsignacionVariable - El UUID de la asignación de variable a finalizar.
 * @returns {Promise<object>} El resultado de la operación.
 * @throws {Error} Lanza un error con statusCode para ser manejado por el controlador.
 */
export const finalizarAsignacionVariable = async (idAsignacionVariable) => {
  logger.debug(`[SERVICIO_ENTRENAMIENTO] Petición para finalizar asignación de variable ID: ${idAsignacionVariable}`);

  try {
    // Validación básica
    if (!idAsignacionVariable || !isValidUUID(idAsignacionVariable)) {
      throwClientError('El ID de la asignación de variable es requerido y debe ser un UUID válido.', 400);
    }
    
    const resultadoDB = await EntrenamientoModel.finalizarAsignacionVariableDB(idAsignacionVariable);

    // Verificar si la operación fue exitosa
    if (!resultadoDB) {
      throwClientError('Error al finalizar la asignación de variable en la base de datos.', 500);
    }

    // Si exito es false, significa que hubo un problema controlado
    if (!resultadoDB.exito) {
      throwClientError(resultadoDB.mensaje || 'No se pudo finalizar la asignación de variable.', 400);
    }

    logger.info(`[SERVICIO_ENTRENAMIENTO] Asignación de variable ID: ${idAsignacionVariable} finalizada correctamente.`);
    return { 
      mensaje: resultadoDB.mensaje, 
      data: {
        asignacionId: resultadoDB.asignacionid,
        detalles: resultadoDB.detalles
      }
    };
    
  } catch (error) {
    logger.error(`[SERVICIO_ENTRENAMIENTO] Error en servicio al finalizar asignación de variable:`, error);
    
    if (error.statusCode) {
      throw error;
    }

    // Si el error tiene el código 'P0001', es un RAISE EXCEPTION de la BD
    if (error.code === 'P0001') {
      throwClientError(error.message, 400);
    }

    // Para cualquier otro tipo de error (problemas de conexión, etc.), lanzamos un error 500 genérico.
    const serverError = new Error('Ocurrió un error inesperado en el servidor al intentar finalizar la asignación de variable.');
    serverError.statusCode = 500;
    throw serverError;
  }
};