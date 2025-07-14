/**
 * @swagger
 * components:
 *   schemas:
 *     Genero:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 *           description: El nombre del género.
 *           example: "Masculino"
 *     TipoDocumento:
 *       type: object
 *       properties:
 *         sigla:
 *           type: string
 *           description: La sigla del tipo de documento.
 *           example: "CC"
 *     Programa:
 *       type: object
 *       properties:
 *         nombre_programa:
 *           type: string
 *           description: El nombre del programa académico.
 *           example: "Ingeniería de Sistemas"
 *     TipoVariableCognitiva:
 *       type: object
 *       properties:
 *         id_variable_cognitiva:
 *           type: string
 *           format: uuid
 *         nombre_variable_cognitiva:
 *           type: string
 *           example: "Lectura Crítica"
 */


import pool from '../config/db.js';
import logger from '../config/logger.js';

/**
 * @file Contiene funciones de modelo de utilidad para obtener IDs de entidades relacionadas.
 */

/**
 * Obtiene el ID de un tipo de documento a partir de su sigla.
 * Llama a la función de base de datos CC.get_tipodocumento_by_sigla.
 * @async
 * @param {string} sigla - La sigla del tipo de documento (ej. "CC", "TI").
 * @returns {Promise<string | null>} El UUID del tipo de documento, o null si no se encuentra.
 * @throws {Error} Si ocurre un error durante la consulta.
 */
export const obtenerIdTipoDocumentoPorSigla = async (sigla) => {
  const queryString = 'SELECT id FROM CC.obteneridtipodocumentoporsiglaufs($1);'; 
  const values = [sigla];
  logger.debug('[MODELO_UTILIDADES] Consultando ID de TipoDocumento por sigla: %s', sigla);
  try {
    const { rows } = await pool.query(queryString, values);
    if (rows.length > 0 && rows[0].id) {
      logger.info(`[MODELO_UTILIDADES] ID de TipoDocumento encontrado para sigla ${sigla}: ${rows[0].id}`);
      return rows[0].id;
    }
    logger.warn(`[MODELO_UTILIDADES] No se encontró ID de TipoDocumento para sigla: ${sigla}`);
    return null;
  } catch (error) {
    logger.error(`[MODELO_UTILIDADES] Error al obtener ID de TipoDocumento por sigla ${sigla}:`, error);
    throw error;
  }
};

/**
 * Obtiene el ID de un género a partir de su nombre.
 * Llama a la vista (o función) de base de datos CC.get_genero_by_nombre.
 * @async
 * @param {string} nombreGenero - El nombre del género (ej. "Masculino", "Femenino").
 * @returns {Promise<string | null>} El UUID del género, o null si no se encuentra.
 * @throws {Error} Si ocurre un error durante la consulta.
 */
export const obtenerIdGeneroPorNombre = async (nombreGenero) => {
  const queryString = 'SELECT id FROM CC.obtenergeneropornombreuft($1);'; 
  const values = [nombreGenero];
  logger.debug('[MODELO_UTILIDADES] Consultando ID de Género por nombre: %s', nombreGenero);
  try {
    const { rows } = await pool.query(queryString, values);
    if (rows.length > 0 && rows[0].id) {
      logger.info(`[MODELO_UTILIDADES] ID de Género encontrado para nombre ${nombreGenero}: ${rows[0].id}`);
      return rows[0].id;
    }
    logger.warn(`[MODELO_UTILIDADES] No se encontró ID de Género para nombre: ${nombreGenero}`);
    return null;
  } catch (error) {
    logger.error(`[MODELO_UTILIDADES] Error al obtener ID de Género por nombre ${nombreGenero}:`, error);
    throw error;
  }
};

/**
 * Representa la estructura de un género obtenido de la vista CC.vistageneros.
 * !!! AJUSTA ESTA DEFINICIÓN SEGÚN LAS COLUMNAS REALES DE TU VISTA CC.vistageneros !!!
 * @typedef {object} GeneroVista
 * @property {string} id - El UUID del género.
 * @property {string} nombre - El nombre del género (ej. "Masculino", "Femenino").
 */

/**
 * Obtiene todos los géneros disponibles desde la vista CC.vistageneros.
 * @async
 * @returns {Promise<GeneroVista[]>} Un array de objetos GeneroVista.
 * @throws {Error} Si ocurre un error durante la consulta.
 */
export const obtenerTodosLosGeneros = async () => {
  const queryString = 'SELECT * FROM CC.VistaGenerosUV;'; 
  logger.debug('[MODELO_UTILIDADES] Consultando todos los géneros desde CC.vistageneros');
  try {
    const { rows } = await pool.query(queryString);
    logger.info(`[MODELO_UTILIDADES] Se encontraron ${rows.length} géneros.`);
    return rows;
  } catch (error) {
    logger.error('[MODELO_UTILIDADES] Error al obtener todos los géneros:', error);
    throw error;
  }
};

/**
 * Representa la estructura de un tipo de documento obtenido de la vista CC.obtenertiposdocumentos.
 * !!! AJUSTA ESTA DEFINICIÓN SEGÚN LAS COLUMNAS REALES DE TU VISTA CC.obtenertiposdocumentos !!!
 * @typedef {object} TipoDocumentoVista
 * @property {string} id - El UUID del tipo de documento.
 * @property {string} sigla - La sigla del tipo de documento (ej. "CC", "TI").
 * @property {string} nombre - El nombre completo del tipo de documento (ej. "Cédula de Ciudadanía").
 */

/**
 * Obtiene todos los tipos de documento disponibles desde la vista CC.obtenertiposdocumentos.
 * @async
 * @returns {Promise<TipoDocumentoVista[]>} Un array de objetos TipoDocumentoVista.
 * @throws {Error} Si ocurre un error durante la consulta.
 */
export const obtenerTodosLosTiposDocumento = async () => {
  const queryString = 'SELECT * FROM CC.VistaSiglasTipoDocumentoUV;'; 
  logger.debug('[MODELO_UTILIDADES] Consultando todos los tipos de documento desde CC.obtenertiposdocumentos');
  try {
    const { rows } = await pool.query(queryString);
    logger.info(`[MODELO_UTILIDADES] Se encontraron ${rows.length} tipos de documento.`);
    return rows;
  } catch (error) {
    logger.error('[MODELO_UTILIDADES] Error al obtener todos los tipos de documento:', error);
    throw error;
  }
};

/**
 * Representa la estructura de un programa obtenido de la vista CC.VistaNombresProgramaUV.
 * !!! AJUSTA ESTA DEFINICIÓN SEGÚN LAS COLUMNAS REALES DE TU VISTA CC.VistaNombresProgramaUV !!!
 * @typedef {object} ProgramaVista
 * @property {string} id - El UUID del programa.
 * @property {string} nombre - El nombre del programa.
 */

/**
 * Obtiene todos los programas disponibles desde la vista CC.VistaNombresProgramaUV.
 * @async
 * @returns {Promise<ProgramaVista[]>} Un array de objetos ProgramaVista.
 * @throws {Error} Si ocurre un error durante la consulta.
 */
export const obtenerTodosLosProgramas = async () => {
  const queryString = 'SELECT * FROM CC.VistaNombresProgramaUV;';
  logger.debug('[MODELO_UTILIDADES] Consultando todos los programas desde CC.VistaNombresProgramaUV');
  try {
    const { rows } = await pool.query(queryString);
    logger.info(`[MODELO_UTILIDADES] Se encontraron ${rows.length} programas.`);
    return rows;
  } catch (error) {
    logger.error('[MODELO_UTILIDADES] Error al obtener todos los programas:', error);
    throw error;
  }
};

/**
 * Representa la estructura de un tipo de variable cognitiva obtenida de la vista CC.ObtenerEntrenamientoCognitivosUV.
 * @typedef {object} TipoVariableCognitivaVista
 * @property {string} id_variable_cognitiva - El UUID de la variable cognitiva.
 * @property {string} nombre_variable_cognitiva - El nombre de la variable cognitiva.
 */

/**
 * Obtiene todos los tipos de variables cognitivas disponibles desde la vista CC.ObtenerEntrenamientoCognitivosUV.
 * @async
 * @returns {Promise<TipoVariableCognitivaVista[]>} Un array de objetos TipoVariableCognitivaVista.
 * @throws {Error} Si ocurre un error durante la consulta.
 */
export const obtenerTiposVariablesCognitivasDB = async () => {
  const queryString = 'SELECT * FROM CC.ObtenerEntrenamientoCognitivosUV;';
  logger.debug('[MODELO_UTILIDADES] Consultando todos los tipos de variables cognitivas desde CC.ObtenerEntrenamientoCognitivosUV');
  try {
    const { rows } = await pool.query(queryString);
    logger.info(`[MODELO_UTILIDADES] Se encontraron ${rows.length} tipos de variables cognitivas.`);
    return rows;
  } catch (error) {
    logger.error('[MODELO_UTILIDADES] Error al obtener todos los tipos de variables cognitivas:', error);
    throw error;
  }
};

/**
 * Obtiene el ID de un estudiante a partir de su tipo y número de documento.
 * Llama a la función de base de datos CC.obteneridestudiantepordocumentoufs.
 * @async
 * @param {string} tipoDocumento - La sigla del tipo de documento (ej. "CC").
 * @param {string} numeroDocumento - El número de documento del estudiante.
 * @returns {Promise<string | null>} El UUID del estudiante, o null si no se encuentra.
 * @throws {Error} Si ocurre un error durante la consulta.
 */
export const obtenerIdEstudiantePorDocumentoDB = async (tipoDocumento, numeroDocumento) => {
  const queryString = 'SELECT CC.obteneridestudiantepordocumentoufs($1, $2) AS estudiante_id;';
  const values = [tipoDocumento, numeroDocumento];
  logger.debug('[MODELO_UTILIDADES] Consultando ID de estudiante por tipoDoc: %s, numDoc: %s', tipoDocumento, numeroDocumento);
  try {
    const { rows } = await pool.query(queryString, values);
    if (rows.length > 0 && rows[0].estudiante_id) {
      logger.info(`[MODELO_UTILIDADES] ID de estudiante encontrado para tipoDoc ${tipoDocumento}, numDoc ${numeroDocumento}: ${rows[0].estudiante_id}`);
      return rows[0].estudiante_id;
    }
    logger.warn(`[MODELO_UTILIDADES] No se encontró ID de estudiante para tipoDoc: ${tipoDocumento}, numDoc: ${numeroDocumento}`);
    return null;
  } catch (error) {
    logger.error(`[MODELO_UTILIDADES] Error al obtener ID de estudiante por documento (tipoDoc: ${tipoDocumento}, numDoc: ${numeroDocumento}):`, error);
    throw error;
  }
}; 