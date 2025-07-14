/**
 * @swagger
 * components:
 *   schemas:
 *     EstudianteEntrenamientoPorFacultad:
 *       type: object
 *       description: Datos resumidos de un estudiante y su entrenamiento, para listas por facultad.
 *       properties:
 *         nombre_estudiante:
 *           type: string
 *         apellido_estudiante:
 *           type: string
 *         numero_documento_estudiante:
 *           type: string
 *         tipo_documento:
 *           type: string
 *           example: "CC"
 *         estado_entrenamiento:
 *           type: string
 *           nullable: true
 *           example: "En Progreso"
 *         fecha_inicio_entrenamiento:
 *           type: string
 *           format: date-time
 *           nullable: true
 *     EntrenamientoCognitivoDetalle:
 *       type: object
 *       description: Detalle completo del entrenamiento de un estudiante.
 *       properties:
 *         estudianteNombres:
 *           type: string
 *         estudianteApellidos:
 *           type: string
 *         estudianteTipoDocumento:
 *           type: string
 *         estudianteNumeroDocumento:
 *           type: string
 *         entrenamientoFechaInicio:
 *           type: string
 *           format: date-time
 *         entrenamientoFechaFin:
 *           type: string
 *           format: date-time
 *         variableCognitivaNombre:
 *           type: string
 *         asignacionVariableEstado:
 *           type: string
 *         entrenamientoEstadoGeneral:
 *           type: string
 *         asignacionVariableId:
 *           type: string
 *           format: uuid
 *     ProgresoVariableDetalle:
 *       type: object
 *       description: Muestra el progreso detallado de una variable cognitiva asignada.
 *       properties:
 *         asignacionVariableId:
 *           type: string
 *           format: uuid
 *         entrenamientoId:
 *           type: string
 *           format: uuid
 *         estudianteId:
 *           type: string
 *           format: uuid
 *         estudianteNombres:
 *           type: string
 *         estudianteApellidos:
 *           type: string
 *         entrenadorNombres:
 *           type: string
 *         variableCognitivaNombre:
 *           type: string
 *         asignacionVariableEstado:
 *           type: string
 *         asignacionNivelInicial:
 *           type: object
 *           description: Objeto JSONB con el estado inicial del nivel.
 *         asignacionMetricasActuales:
 *           type: object
 *           description: Objeto JSONB con las métricas actuales.
 *         totalSesiones:
 *           type: integer
 *         sesionesFinalizadas:
 *           type: integer
 *         sesionesAbandonadas:
 *           type: integer
 *         sesionesDetalle:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               sesionId:
 *                 type: string
 *                 format: uuid
 *               numeroSesion:
 *                 type: integer
 *               estado:
 *                 type: string
 *               fechaInicio:
 *                 type: string
 *                 format: date-time
 *               fechaFin:
 *                 type: string
 *                 format: date-time
 *               observacion:
 *                 type: string
 */

import pool from '../config/db.js';
import logger from '../config/logger.js';

/**
 * @file Contiene las funciones de acceso a datos para obtener estudiantes por facultad.
 */

/**
 * Representa la estructura de los datos de un estudiante y su entrenamiento,
 * obtenidos a través de la función CC.get_estudiantes_por_facultad.
 * @typedef {object} EstudianteEntrenamientoPorFacultad
 * @property {string} nombre_estudiante - Nombre del estudiante.
 * @property {string} apellido_estudiante - Apellido del estudiante.
 * @property {string} numero_documento_estudiante - Número de documento del estudiante.
 * @property {string} tipo_documento - Sigla del tipo de documento del estudiante.
 * @property {string | null} estado_entrenamiento - Estado actual del entrenamiento cognitivo (puede ser nulo).
 * @property {Date | null} fecha_inicio_entrenamiento - Fecha de inicio del entrenamiento cognitivo (puede ser nulo).
 */

/**
 * Obtiene los estudiantes y sus datos de entrenamiento para una facultad específica
 * utilizando la función de base de datos CC.get_estudiantes_por_facultad.
 * @async
 * @param {string} facultadId - El UUID de la facultad.
 * @returns {Promise<EstudianteEntrenamientoPorFacultad[]>} Un array de objetos EstudianteEntrenamientoPorFacultad.
 * @throws {Error} Si ocurre un error durante la consulta o si el facultadId no es válido.
 */
export const obtenerEstudiantesPorFacultad = async (facultadId) => {
  if (!facultadId) { 
    logger.warn('[MODELO_ESTUDIANTES_ENTRENAMIENTOS] Se intentó llamar a obtenerEstudiantesPorFacultad sin un facultadId.');
    throw new Error('El ID de la facultad es requerido.');
  }


  //const queryString = 'SELECT * FROM CC.ObtenerEstudiantesPorFacultadUV WHERE facultad=$1;'
  const queryString = 'SELECT * FROM CC.obtenerestudiantesporfacultaduft($1);';
  const values = [facultadId];

  logger.debug('[MODELO_ESTUDIANTES_ENTRENAMIENTOS] Ejecutando obtenerEstudiantesPorFacultad con query: %s y ID de facultad: %s', queryString, facultadId);
  try {
    const { rows } = await pool.query(queryString, values);
    logger.info(`[MODELO_ESTUDIANTES_ENTRENAMIENTOS] Se encontraron ${rows.length} estudiantes para la facultad ID ${facultadId}.`);
    return rows;
  } catch (error) {
    logger.error(`[MODELO_ESTUDIANTES_ENTRENAMIENTOS] Error al consultar estudiantes por facultad ID ${facultadId} desde la BD:`, error);
    throw error; 
  }
};

/**
 * Representa la estructura detallada de un entrenamiento cognitivo para un estudiante específico.
 * OBTENIDA DE LA FUNCIÓN CC.obtener_entrenamiento_cognitivo_estudiante.
 * @typedef {object} EntrenamientoCognitivoDetalle
 * @property {string} id_entrenamiento - Ejemplo: UUID del entrenamiento.
 * @property {string} nombre_entrenamiento - Ejemplo: Nombre del tipo de entrenamiento.
 * @property {Date} fecha_asignacion - Ejemplo: Fecha en que se asignó.
 * @property {string} estado_actual - Ejemplo: Estado como 'En Progreso', 'Completado'.
 * @property {number} progreso - Ejemplo: Progreso numérico (e.g., 0-100).
 * @property {string} nombre_estudiante_completo - Ejemplo: Nombre completo del estudiante.
 * @property {string} tipo_documento_estudiante - Ejemplo: Tipo de documento del estudiante.
 * @property {string} numero_documento_estudiante - Ejemplo: Número de documento del estudiante.
 */

/**
 * Obtiene el detalle del entrenamiento cognitivo para un estudiante específico
 * utilizando su tipo y número de documento.
 * Llama a la función de base de datos CC.obtener_entrenamiento_cognitivo_estudiante.
 * La función de BD puede devolver múltiples filas si un estudiante tiene varios registros de entrenamiento.
 * @async
 * @param {string} tipoDocumento - Sigla del tipo de documento (ej. 'CC').
 * @param {string} numeroDocumento - Número de documento del estudiante.
 * @returns {Promise<EntrenamientoCognitivoDetalle[]>} Un array con los detalles de los entrenamientos, o un array vacío si no se encuentra ninguno.
 * @throws {Error} Si ocurre un error durante la consulta.
 */
export const obtenerEntrenamientoCognitivoPorDocumento = async (tipoDocumento, numeroDocumento) => {
  const queryString = `SELECT * FROM CC.DetalleEntrenamientoEstudianteUV WHERE "estudianteTipoDocumento" = $1 AND "estudianteNumeroDocumento" = $2;`;
  const values = [tipoDocumento, numeroDocumento];

  logger.debug('[MODELO_ESTUDIANTES_ENTRENAMIENTOS] Ejecutando obtenerEntrenamientoCognitivoPorDocumento con tipoDoc: %s, numDoc: %s', tipoDocumento, numeroDocumento);
  try {
    const { rows } = await pool.query(queryString, values);
    logger.info(`[MODELO_ESTUDIANTES_ENTRENAMIENTOS] Se encontraron ${rows.length} registros de entrenamiento para tipoDoc: ${tipoDocumento}, numDoc: ${numeroDocumento}.`);
    return rows; 
  } catch (error) {
    logger.error(`[MODELO_ESTUDIANTES_ENTRENAMIENTOS] Error al consultar entrenamiento por documento (tipoDoc: ${tipoDocumento}, numDoc: ${numeroDocumento}):`, error);
    throw error;
  }
};

/**
 * @typedef {object} CrearEntrenamientoCognitivoDataDB
 * @property {string} pSiglaTipoDocEstudiante - Sigla del tipo de documento del estudiante.
 * @property {string} pNumeroDocEstudiante - Número de documento del estudiante.
 * @property {string} pSiglaTipoDocEntrenador - Sigla del tipo de documento del entrenador.
 * @property {string} pNumeroDocEntrenador - Número de documento del entrenador.
 * @property {string[]} pVariablesCognitivas - Array de nombres de variables cognitivas.
 * @property {string} pFechaFinEntrenamiento - Fecha de fin del entrenamiento (opcional).
 */

/**
 * Llama a la función de la base de datos CC.CrearEntrenamientoCognitivoUFT
 * para crear un nuevo entrenamiento cognitivo completo.
 * @async
 * @param {CrearEntrenamientoCognitivoDataDB} datosEntrenamiento - Los datos del entrenamiento a crear.
 * @returns {Promise<{entrenamientoId: string | null, mensaje: string}>} Un objeto con el ID del entrenamiento creado y un mensaje.
 * @throws {Error} Si ocurre un error durante la ejecución de la función de BD.
 */
export const crearEntrenamientoCognitivoDB = async (datosEntrenamiento) => {
  const {
    pSiglaTipoDocEstudiante,
    pNumeroDocEstudiante,
    pSiglaTipoDocEntrenador,
    pNumeroDocEntrenador,
    pVariablesCognitivas,
    pFechaFinEntrenamiento,
  } = datosEntrenamiento;

  const queryString = `
    SELECT * FROM CC.CrearEntrenamientoCognitivoUFT($1, $2, $3, $4, $5, $6);
  `;
  const values = [
    pSiglaTipoDocEstudiante,
    pNumeroDocEstudiante,
    pSiglaTipoDocEntrenador,
    pNumeroDocEntrenador,
    pVariablesCognitivas,
    pFechaFinEntrenamiento || '2500-12-31', // Usar valor por defecto si no se proporciona
  ];

  logger.debug('[MODELO_ENTRENAMIENTO] Llamando a CC.CrearEntrenamientoCognitivoUFT con datos:', datosEntrenamiento);
  try {
    const { rows } = await pool.query(queryString, values);
    if (rows.length > 0) {
      const { mensaje, entrenamientocognitivoid, detalles } = rows[0]; // La BD devuelve mensaje, entrenamientoCognitivoId y detalles
      logger.info(`[MODELO_ENTRENAMIENTO] Resultado de CrearEntrenamientoCognitivoUFT: ID=${entrenamientocognitivoid}, Mensaje='${mensaje}'`);
      return { entrenamientoId: entrenamientocognitivoid, mensaje, detalles };
    }
    logger.error('[MODELO_ENTRENAMIENTO] La función CrearEntrenamientoCognitivoUFT no devolvió resultados.');
    throw new Error('La función de base de datos no devolvió un resultado esperado.');
  } catch (error) {
    logger.error('[MODELO_ENTRENAMIENTO] Error al llamar a la función CC.CrearEntrenamientoCognitivoUFT:', error);
    throw error;
  }
};

/**
 * @typedef {object} RegistrarEntrenamientoAsignacionDataDB
 * @property {string} pEstudianteId - UUID del estudiante.
 * @property {string} pFechaInicio - Fecha de inicio del entrenamiento en formato 'YYYY-MM-DD HH:MM:SS'.
 * @property {string[]} pTiposVariablesCognitivasIds - Array de UUIDs de los tipos de variables cognitivas.
 * @property {object} pNivelInicial - Objeto JSON con el nivel inicial.
 * @property {object} pMetricas - Objeto JSON con las métricas.
 */

/**
 * Llama a la función de la base de datos CC.RegistrarEntrenamientoYAsignacion
 * para crear un nuevo entrenamiento y sus asignaciones de variables.
 * @async
 * @param {RegistrarEntrenamientoAsignacionDataDB} datosAsignacion - Los datos para la nueva asignación.
 * @returns {Promise<string>} Un mensaje de texto indicando el resultado de la operación.
 * @throws {Error} Si ocurre un error durante la ejecución de la función de BD.
 */
export const registrarEntrenamientoAsignacionDB = async (datosAsignacion) => {
  const {
    pEstudianteId,
    pFechaInicio,
    pTiposVariablesCognitivasIds,
    pNivelInicial,
    pMetricas,
  } = datosAsignacion;

  const queryString = `
    SELECT CC.RegistrarEntrenamientoAsignacionUFS($1::UUID, $2::TIMESTAMP, $3::UUID[], $4::JSONB, $5::JSONB) as mensaje;
  `;
  const values = [
    pEstudianteId,
    pFechaInicio,
    pTiposVariablesCognitivasIds,
    pNivelInicial,
    pMetricas,
  ];

  logger.debug('[MODELO_ESTUDIANTES_ENTRENAMIENTOS] Llamando a CC.registrarentrenamientoyasignacion con datos:', datosAsignacion);
  try {
    const { rows } = await pool.query(queryString, values);
    if (rows.length > 0) {
      const { mensaje } = rows[0];
      logger.info(`[MODELO_ESTUDIANTES_ENTRENAMIENTOS] Resultado de registrarentrenamientoyasignacion: Mensaje='${mensaje}'`);
      return mensaje;
    }
    logger.error('[MODELO_ESTUDIANTES_ENTRENAMIENTOS] La función registrarentrenamientoyasignacion no devolvió un mensaje.');
    throw new Error('La función de base de datos no devolvió un resultado esperado.');
  } catch (error) {
    logger.error('[MODELO_ESTUDIANTES_ENTRENAMIENTOS] Error al llamar a la función CC.registrarentrenamientoyasignacion:', error);
    throw error;
  }
};


/**
 * Obtiene el progreso detallado de una asignación de variable específica.
 * Llama a la vista de la base de datos CC.ProgresoVariableUV.
 * @async
 * @param {string} asignacionVariableId - El UUID de la asignación de variable.
 * @returns {Promise<object|null>} Un objeto con todos los detalles del progreso, o null si no se encuentra.
 * @throws {Error} Si ocurre un error durante la consulta.
 */
export const obtenerProgresoVariablePorId = async (asignacionVariableId) => {
  const queryString = 'SELECT * FROM CC.ProgresoVariableUV WHERE "asignacionVariableId" = $1;';
  const values = [asignacionVariableId];

  logger.debug('[MODELO_ENTRENAMIENTO] Ejecutando obtenerProgresoVariablePorId con ID: %s', asignacionVariableId);
  try {
    const { rows } = await pool.query(queryString, values);
    if (rows.length > 0) {
      logger.info(`[MODELO_ENTRENAMIENTO] Se encontró el detalle de progreso para la asignación ID ${asignacionVariableId}.`);
      return rows[0]; // Devuelve el objeto único de progreso
    }
    logger.warn(`[MODELO_ENTRENAMIENTO] No se encontró progreso para la asignación ID: ${asignacionVariableId}`);
    return null; // No se encontró
  } catch (error) {
    logger.error(`[MODELO_ENTRENAMIENTO] Error al consultar progreso por ID de asignación (${asignacionVariableId}):`, error);
    throw error;
  }
};



/**
 * Llama a la función de la base de datos para actualizar la observación de una sesión.
 * @async
 * @param {string} idSesion - El UUID de la sesión a actualizar.
 * @param {string} nuevaObservacion - El nuevo texto de la observación.
 * @returns {Promise<object>} El resultado devuelto por la función de la base de datos.
 * @throws {Error} Si ocurre un error durante la consulta.
 */
export const actualizarObservacionSesionDB = async (idSesion, nuevaObservacion) => {
  const queryString = 'SELECT * FROM CC.ActualizarObservacionSesionUFT($1, $2);';
  const values = [idSesion, nuevaObservacion];

  logger.debug('[MODELO_ENTRENAMIENTO] Llamando a ActualizarObservacionSesionUFT con ID de sesión: %s', idSesion);
  try {
    const { rows } = await pool.query(queryString, values);
    if (rows.length > 0) {
      logger.info(`[MODELO_ENTRENAMIENTO] Observación actualizada para sesión ${idSesion}. Mensaje DB: ${rows[0].mensaje}`);
      return rows[0]; // La función de BD devuelve una tabla, tomamos la primera fila.
    }
    logger.warn('[MODELO_ENTRENAMIENTO] La función ActualizarObservacionSesionUFT no devolvió filas.');
    throw new Error('La operación en la base de datos no devolvió un resultado.');
  } catch (error) {
    logger.error(`[MODELO_ENTRENAMIENTO] Error al ejecutar ActualizarObservacionSesionUFT para sesión ${idSesion}:`, error);
    throw error; // Propagamos el error para manejarlo en el controlador.
  }
};

/**
 * @typedef {object} ModificarEntrenamientoCognitivoDataDB
 * @property {string} pSiglaTipoDocEstudiante - Sigla del tipo de documento del estudiante.
 * @property {string} pNumeroDocEstudiante - Número de documento del estudiante.
 * @property {string[] | null} pVariablesAAgregar - Nombres de variables a añadir.
 * @property {string[] | null} pVariablesARemover - Nombres de variables a quitar.
 * @property {string | null} pSiglaTipoDocNuevoEntrenador - Sigla del tipo de documento del nuevo entrenador.
 * @property {string | null} pNumeroDocNuevoEntrenador - Número de documento del nuevo entrenador.
 * @property {string | null} pNuevaFechaFinEntrenamiento - Nueva fecha de fin del entrenamiento.
 */

/**
 * Representa el resultado de la función de modificación de entrenamiento cognitivo.
 * @typedef {object} ResultadoModificacionEntrenamiento
 * @property {string} mensaje - Mensaje de resultado de la operación.
 * @property {string} entrenamientocognitivoid - El UUID del entrenamiento modificado.
 * @property {string[]} detalles - Un array con los detalles de las operaciones realizadas.
 */

/**
 * Llama a la función de la base de datos CC.modificarentrenamientocognitivouft
 * para aplicar cambios a un entrenamiento cognitivo existente.
 * @async
 * @param {ModificarEntrenamientoCognitivoDataDB} datos - Los datos para la modificación.
 * @returns {Promise<ResultadoModificacionEntrenamiento>} El resultado de la operación desde la base de datos.
 * @throws {Error} Si ocurre un error durante la ejecución de la función de BD.
 */
export const modificarEntrenamientoCognitivoDB = async (datos) => {
  const {
    pSiglaTipoDocEstudiante,
    pNumeroDocEstudiante,
    pVariablesAAgregar,
    pVariablesARemover,
    pSiglaTipoDocNuevoEntrenador,
    pNumeroDocNuevoEntrenador,
    pNuevaFechaFinEntrenamiento,
  } = datos;

  const queryString = `
    SELECT * FROM cc.modificarentrenamientocognitivouft($1, $2, $3, $4, $5, $6, $7);
  `;
  const values = [
    pSiglaTipoDocEstudiante,
    pNumeroDocEstudiante,
    pVariablesAAgregar,
    pVariablesARemover,
    pSiglaTipoDocNuevoEntrenador,
    pNumeroDocNuevoEntrenador,
    pNuevaFechaFinEntrenamiento,
  ];

  logger.debug('[MODELO_ENTRENAMIENTO] Llamando a cc.modificarentrenamientocognitivouft con datos:', datos);
  try {
    const { rows } = await pool.query(queryString, values);
    if (rows.length > 0) {
      logger.info(`[MODELO_ENTRENAMIENTO] Resultado de modificarentrenamientocognitivouft: ${rows[0].mensaje}`);
      return rows[0];
    }
    logger.error('[MODELO_ENTRENAMIENTO] La función modificarentrenamientocognitivouft no devolvió resultados.');
    throw new Error('La función de base de datos no devolvió un resultado esperado.');
  } catch (error) {
    logger.error('[MODELO_ENTRENAMIENTO] Error al llamar a la función cc.modificarentrenamientocognitivouft:', error);
    throw error;
  }
};



/**
 * Llama a la función de la BD para crear una nueva sesión.
 * @param {object} datos - Datos de la sesión.
 * @returns {Promise<object>} El resultado de la función de la BD.
 */
export const crearSesionDB = async (datos) => {
  const queryString = `SELECT * FROM CC.CrearSesionEntrenamientoUFT($1, $2, $3, $4, $5);`;
  const values = [
    datos.pSiglaTipoDocEstudiante,
    datos.pNumeroDocEstudiante,
    datos.pNombreVariableCognitiva,
    datos.pFechaInicio,
    datos.pObservacion
  ];

  logger.debug('[MODELO_ENTRENAMIENTO] Llamando a CrearSesionEntrenamientoUFT con datos: %o', datos);
  try {
    const { rows } = await pool.query(queryString, values);
    return rows[0];
  } catch (error) {
    logger.error('[MODELO_ENTRENAMIENTO] Error al ejecutar CrearSesionEntrenamientoUFT:', error);
    throw error;
  }
};


/**
 * Llama a la función de la BD para iniciar una sesión.
 * @param {string} idSesion - UUID de la sesión.
 * @returns {Promise<object>} El resultado de la función de la BD.
 */
export const iniciarSesionDB = async (idSesion) => {
    const queryString = `SELECT * FROM CC.IniciarSesionEntrenamientoUFT($1);`;
    const values = [idSesion];
    logger.debug(`[MODELO_ENTRENAMIENTO] Llamando a IniciarSesionEntrenamientoUFT para sesión ID: ${idSesion}`);
    try {
        const { rows } = await pool.query(queryString, values);
        return rows[0];
    } catch (error) {
        logger.error(`[MODELO_ENTRENAMIENTO] Error al ejecutar IniciarSesionEntrenamientoUFT:`, error);
        throw error;
    }
};

/**
 * Llama a la función de la BD para finalizar una sesión de entrenamiento.
 * @param {string} idSesion - UUID de la sesión a finalizar.
 * @param {object} nuevasMetricas - Objeto JSON con las nuevas métricas.
 * @param {object} nuevoNivelInicial - Objeto JSON con el nuevo nivel inicial.
 * @returns {Promise<object>} El resultado de la función de la BD.
 */
export const finalizarSesionDB = async (idSesion, nuevasMetricas, nuevoNivelInicial) => {
    const queryString = `SELECT * FROM CC.FinalizarSesionEntrenamientoUFT($1, $2, $3);`;
    const values = [idSesion, nuevasMetricas, nuevoNivelInicial];
    
    logger.debug(`[MODELO_ENTRENAMIENTO] Llamando a FinalizarSesionEntrenamientoUFT para sesión ID: ${idSesion}`);
    try {
        const { rows } = await pool.query(queryString, values);
        return rows[0];
    } catch (error) {
        logger.error(`[MODELO_ENTRENAMIENTO] Error al ejecutar FinalizarSesionEntrenamientoUFT:`, error);
        throw error;
    }
};

/**
 * Llama a la función de la BD para finalizar una asignación de variable cognitiva.
 * @param {string} idAsignacionVariable - UUID de la asignación de variable a finalizar.
 * @returns {Promise<object>} El resultado de la función de la BD.
 */
export const finalizarAsignacionVariableDB = async (idAsignacionVariable) => {
    const queryString = `SELECT * FROM CC.FinalizarAsignacionVariableUFT($1);`;
    const values = [idAsignacionVariable];
    
    logger.debug(`[MODELO_ENTRENAMIENTO] Llamando a FinalizarAsignacionVariableUFT para asignación ID: ${idAsignacionVariable}`);
    try {
        const { rows } = await pool.query(queryString, values);
        return rows[0];
    } catch (error) {
        logger.error(`[MODELO_ENTRENAMIENTO] Error al ejecutar FinalizarAsignacionVariableUFT:`, error);
        throw error;
    }
};