/**
 * @swagger
 * components:
 *   schemas:
 *     Entrenador:
 *       type: object
 *       description: Representa a un entrenador en el sistema.
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: El ID único del entrenador.
 *         tipoDocumento:
 *           type: string
 *           format: uuid
 *           description: ID de la tabla TipoDocumento.
 *         nombres:
 *           type: string
 *           description: Nombres del entrenador.
 *           example: "Mónica"
 *         apellidos:
 *           type: string
 *           description: Apellidos del entrenador.
 *           example: "Escobar Melendez"
 *         numeroDocumento:
 *           type: string
 *           description: Número de documento del entrenador.
 *           example: "123456789"
 *         fechaInicio:
 *           type: string
 *           format: date-time
 *           description: Fecha de inicio del contrato del entrenador.
 *         fechaFin:
 *           type: string
 *           format: date-time
 *           description: Fecha de finalización del contrato del entrenador.
 *         correo:
 *           type: string
 *           format: email
 *           description: Correo electrónico del entrenador.
 *     EntrenadorFacultadResponse:
 *       type: object
 *       properties:
 *         facultad_id:
 *           type: string
 *           format: uuid
 *           description: ID de la facultad.
 *         nombre_facultad:
 *           type: string
 *           description: Nombre de la facultad.
 *           example: "Ingenierías"
 *     DatosEntrenadorPorCorreoResponse:
 *       type: object
 *       properties:
 *         numeroDocumento:
 *           type: string
 *           description: Número de documento del entrenador.
 *         siglaTipoDocumento:
 *           type: string
 *           description: Sigla del tipo de documento.
 *         nombres:
 *           type: string
 *           description: Nombres del entrenador.
 *         apellidos:
 *           type: string
 *           description: Apellidos del entrenador.
 */

import pool from '../config/db.js';
import logger from '../config/logger.js';

/**
 * @file Contiene las funciones de acceso a datos para la entidad Entrenador.
 */

/**
 * Registra un nuevo entrenador en la base de datos utilizando la función PL/pgSQL.
 * @async
 * @param {object} datosEntrenador - Datos del entrenador a registrar.
 * @param {string} datosEntrenador.pSiglaTipoDocumento - Sigla del tipo de documento.
 * @param {string} datosEntrenador.pNombres - Nombres del entrenador.
 * @param {string} datosEntrenador.pApellidos - Apellidos del entrenador.
 * @param {string} datosEntrenador.pNumeroDocumento - Número de documento.
 * @param {string} datosEntrenador.pCorreo - Correo electrónico.
 * @param {string[]} datosEntrenador.pFacultadNombres - Array con nombres de las facultades.
 * @param {string} [datosEntrenador.pFechaFin] - Fecha de fin del contrato (opcional, formato YYYY-MM-DD).
 * @returns {Promise<object|null>} La primera fila del resultado de la función de base de datos
 * (que contiene mensaje, identrenador, detalles), o null si no hay resultado.
 * @throws {Error} Si ocurre un error durante la consulta a la base de datos.
 */
export const registrar = async (datosEntrenador) => {
  const {
    pSiglaTipoDocumento,
    pNombres,
    pApellidos,
    pNumeroDocumento,
    pCorreo,
    pFacultadNombres,
    pFechaFin,
  } = datosEntrenador;

  const queryParams = [
    pSiglaTipoDocumento,
    pNombres,
    pApellidos,
    pNumeroDocumento,
    pCorreo,
    pFacultadNombres,
    pFechaFin
  ];

  const queryString = `SELECT * FROM CC.RegistrarEntrenadorUFT($1, $2, $3, $4, $5, $6, $7);`;

  logger.debug('[MODELO_ENTRENADOR] Ejecutando registrar con query: %s y params: %o', queryString, queryParams);
  try {
    const { rows } = await pool.query(queryString, queryParams);
    
    logger.debug('[MODELO_ENTRENador] Filas devueltas por la función de BD: %o', rows);

    if (rows.length > 0) {
      // La función de BD devuelve una tabla, tomamos la primera fila.
      logger.info('[MODELO_ENTRENADOR] Entrenador procesado por función DB, resultado: %o', rows[0]);
      return rows[0]; 
    }
    logger.warn('[MODELO_ENTRENADOR] La función RegistrarEntrenadorUFT no devolvió filas.');
    return null; // Indica que la función DB no devolvió datos, el servicio lo manejará.
  } catch (error) {
    if (error.code === '23505') { // Violación de unicidad
      logger.warn(`[MODELO_ENTRENADOR] Violación de unicidad detectada en BD al registrar entrenador: ${error.message}`, { detail: error.detail, hint: error.hint });
    } else { // Otros errores de BD
      logger.error('[MODELO_ENTRENADOR] Error al ejecutar RegistrarEntrenadorUFT en la BD:', error);
    }
    throw error; // Siempre relanzar para que el servicio lo maneje
  }
};

/**
 * Obtiene los entrenadores con sus facultades asignadas, con opción de filtrar por nombre de facultad.
 * Ordena por apellidos y luego por nombres.
 * @async
 * @param {object} [filtros={}] - Objeto opcional con los filtros a aplicar.
 * @param {string} [filtros.nombreFacultad] - Nombre de la facultad por la cual filtrar.
 * @returns {Promise<Array<object>>} Un array de objetos de entrenadores.
 * @throws {Error} Si ocurre un error durante la consulta.
 */
export const obtenerTodos = async (filtros = {}) => {
  let queryString = 'SELECT * FROM CC.DetalleEntrenadoresFacultadesUV';
  const queryParams = [];
  const condicionesWhere = [];

  if (filtros.nombreFacultad) {
    queryParams.push(filtros.nombreFacultad);
    // Usamos $N para el placeholder y lo añadimos al array de parámetros
    condicionesWhere.push(`$${queryParams.length} = ANY(facultadesAsignadas)`);
    logger.debug('[MODELO_ENTRENADOR] Aplicando filtro: facultadNombre = %s', filtros.nombreFacultad);
  }

  if (condicionesWhere.length > 0) {
    queryString += ` WHERE ${condicionesWhere.join(' AND ')}`;
  }

  queryString += ' ORDER BY apellidosEntrenador, nombresEntrenador;';
  
  logger.debug('[MODELO_ENTRENADOR] Ejecutando obtenerTodos con query: %s, params: %o', queryString, queryParams);
  try {
    const { rows } = await pool.query(queryString, queryParams);
    logger.info(`[MODELO_ENTRENADOR] Se encontraron ${rows.length} entrenadores (con filtros aplicados).`);
    logger.debug('[MODELO_ENTRENADOR] Datos de entrenadores listados (filtrados): %o', rows);
    return rows;
  } catch (error) {
    logger.error('[MODELO_ENTRENADOR] Error al listar entrenadores (filtrados) desde la BD:', error);
    throw error;
  }
};


/**
 * Actualiza la información de un entrenador existente utilizando la función PL/pgSQL.
 * @async
 * @param {string} entrenadorID - El UUID del entrenador a modificar.
 * @param {object} datosAActualizar - Campos a actualizar.
 * @param {string} [datosAActualizar.pNuevosNombres]
 * @param {string} [datosAActualizar.pNuevosApellidos]
 * @param {string} [datosAActualizar.pNuevoCorreo]
 * @param {Date|string|null} [datosAActualizar.pNuevaFechaFin]
 * @param {string[]|null} [datosAActualizar.pNuevosNombresFacultades]
 * @returns {Promise<object|null>} La primera fila del resultado de la función de base de datos.
 * @throws {Error} Si ocurre un error durante la consulta, o si el entrenador no se encuentra.
 */
export const actualizar = async (entrenadorID, datosAActualizar) => {
  const {
    pNuevosNombres,
    pNuevosApellidos,
    pNuevoCorreo,
    pNuevaFechaFin,
    pNuevosNombresFacultades,
  } = datosAActualizar;

  const queryParams = [
    entrenadorID,               // $1
    pNuevosNombres,             // $2
    pNuevosApellidos,           // $3
    pNuevoCorreo,               // $4
    pNuevaFechaFin,             // $5
    pNuevosNombresFacultades,   // $6
  ];

  // Query para llamar a la función de BD ModificarInformacionEntrenadorUFT creadi de forma dinámica
  const queryString = 'SELECT * FROM CC.ModificarInformacionEntrenadorUFT($1, $2, $3, $4, $5, $6);';

  logger.debug('[MODELO_ENTRENADOR] Ejecutando actualizar con query: %s y params: %o', queryString, queryParams);
  try {
    const { rows } = await pool.query(queryString, queryParams);
    logger.debug('[MODELO_ENTRENADOR] Filas devueltas por ModificarInformacionEntrenadorUFT: %o', rows);
    if (rows.length > 0) {
      logger.info('[MODELO_ENTRENADOR] Información de entrenador actualizada vía DB función, resultado: %o', rows[0]);
      return rows[0];
    }
    logger.warn('[MODELO_ENTRENADOR] La función ModificarInformacionEntrenadorUFT no devolvió filas (inesperado).');
    return null;
  } catch (error) {
    // La función de BD ahora lanza "Entrenador con ID % no encontrado." si no existe.
    logger.error('[MODELO_ENTRENADOR] Error al ejecutar ModificarInformacionEntrenadorUFT en la BD:', error);
    throw error;
  }
};

/**
 * Desactiva un entrenador en la base de datos estableciendo su fechaFin a la actual.
 * Llama a la función PL/pgSQL CC.DesactivarEntrenadorUFT.
 * @async
 * @param {string} entrenadorID - El UUID del entrenador a desactivar.
 * @returns {Promise<object|null>} La primera fila del resultado de la función de base de datos
 * (que contiene mensaje, entrenadorId, exito), o null si no hay resultado.
 * @throws {Error} Si ocurre un error durante la consulta.
 */
export const desactivar = async (entrenadorID) => {
  const queryString = 'SELECT * FROM CC.DesactivarEntrenadorUFT($1);';
  const queryParams = [entrenadorID];

  logger.debug('[MODELO_ENTRENADOR] Ejecutando desactivar con query: %s y params: %o', queryString, queryParams);
  try {
    const { rows } = await pool.query(queryString, queryParams);
    logger.debug('[MODELO_ENTRENADOR] Filas devueltas por DesactivarEntrenadorUFT: %o', rows);
    if (rows.length > 0) {
      logger.info('[MODELO_ENTRENADOR] Desactivación de entrenador procesada por DB función, resultado: %o', rows[0]);
      return rows[0]; 
    }
    logger.warn('[MODELO_ENTRENADOR] La función DesactivarEntrenadorUFT no devolvió filas (inesperado).');
    return null;
  } catch (error) {
    logger.error('[MODELO_ENTRENADOR] Error al ejecutar DesactivarEntrenadorUFT en la BD:', error);
    throw error;
  }
};

/**
 * Obtiene las facultades asociadas a un entrenador dado su correo electrónico.
 * Llama a la función de la base de datos CC.ObtenerEntrenadorPorEmailUFT.
 * @async
 * @param {string} pCorreo - El correo electrónico del entrenador.
 * @returns {Promise<Array<object>>} Un array de objetos con `facultad_id` y `nombre_facultad`.
 * @throws {Error} Si ocurre un error durante la consulta a la base de datos.
 */
export const obtenerFacultadesPorEmailDB = async (pCorreo) => {
  const queryString = `
    SELECT * FROM CC.ObtenerEntrenadorPorEmailUFT($1);
  `;
  const values = [pCorreo];

  logger.debug('[MODELO_ENTRENADOR] Llamando a CC.ObtenerEntrenadorPorEmailUFT con correo: %s', pCorreo);
  try {
    const { rows } = await pool.query(queryString, values);
    logger.info(`[MODELO_ENTRENADOR] Se encontraron ${rows.length} facultades para el correo: ${pCorreo}.`);
    logger.debug('[MODELO_ENTRENADOR] Facultades encontradas: %o', rows);
    return rows;
  } catch (error) {
    logger.error('[MODELO_ENTRENADOR] Error al llamar a la función CC.ObtenerEntrenadorPorEmailUFT:', error);
    throw error;
  }
};

/**
 * Obtiene el ID de un entrenador por su tipo y número de documento.
 * @async
 * @param {string} numeroDocumento - El número de documento del entrenador.
 * @param {string} tipoDocumentoId - El UUID del tipo de documento.
 * @returns {Promise<object|null>} Un objeto con el ID del entrenador o null si no se encuentra.
 * @throws {Error} Si ocurre un error durante la consulta a la base de datos.
 */
export const obtenerDatosPorCorreo = async (correo) => {
  const queryString = `
    SELECT 
      e.numerodocumento,
      td.sigla as siglaTipoDocumento,
      e.nombres,
      e.apellidos
    FROM CC.entrenador e
    INNER JOIN CC.tipodocumento td ON e.tipodocumento = td.id
    WHERE e.correo = $1;
  `;
  const values = [correo];

  logger.debug('[MODELO_ENTRENADOR] Ejecutando obtenerDatosPorCorreo con correo: %s', correo);
  try {
    const { rows } = await pool.query(queryString, values);
    if (rows.length > 0) {
      logger.info(`[MODELO_ENTRENADOR] Entrenador encontrado para correo: ${correo}`);
      return {
        numeroDocumento: rows[0].numerodocumento,
        siglaTipoDocumento: rows[0].siglatipodocumento,
        nombres: rows[0].nombres,
        apellidos: rows[0].apellidos
      };
    }
    logger.info(`[MODELO_ENTRENADOR] No se encontró entrenador con correo: ${correo}`);
    return null;
  } catch (error) {
    logger.error('[MODELO_ENTRENADOR] Error al obtener datos de entrenador por correo:', error);
    throw error;
  }
};

/**
 * Crea una relación entre un entrenador y un entrenamiento cognitivo.
 * @async
 * @param {string} entrenadorId - El UUID del entrenador.
 * @param {string} entrenamientoCognitivoId - El UUID del entrenamiento cognitivo.
 * @returns {Promise<object>} Un objeto con el resultado de la inserción.
 * @throws {Error} Si ocurre un error durante la inserción.
 */
export const crearEntrenadorEntrenamiento = async (entrenadorId, entrenamientoCognitivoId) => {
  const queryString = `
    INSERT INTO CC.entrenadorentrenamiento (id, entrenador, entrenamientocognitivo)
    VALUES (gen_random_uuid(), $1, $2)
    RETURNING id, entrenador, entrenamientocognitivo;
  `;
  const values = [entrenadorId, entrenamientoCognitivoId];

  logger.debug('[MODELO_ENTRENADOR] Ejecutando crearEntrenadorEntrenamiento con entrenadorId: %s, entrenamientoCognitivoId: %s', entrenadorId, entrenamientoCognitivoId);
  
  try {
    const { rows } = await pool.query(queryString, values);
    if (rows.length > 0) {
      logger.info(`[MODELO_ENTRENADOR] Relación entrenador-entrenamiento creada exitosamente con ID: ${rows[0].id}`);
      return {
        id: rows[0].id,
        entrenador: rows[0].entrenador,
        entrenamientocognitivo: rows[0].entrenamientocognitivo,
        mensaje: 'Relación entrenador-entrenamiento creada exitosamente.'
      };
    }
    logger.error('[MODELO_ENTRENADOR] La inserción no devolvió filas.');
    throw new Error('No se pudo crear la relación entrenador-entrenamiento.');
  } catch (error) {
    logger.error('[MODELO_ENTRENADOR] Error al crear relación entrenador-entrenamiento:', error);
    throw error;
  }
};