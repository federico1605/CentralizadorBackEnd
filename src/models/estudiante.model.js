/**
 * @swagger
 * components:
 *   schemas:
 *     Estudiante:
 *       type: object
 *       description: Representa a un estudiante en el sistema.
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: El ID único del estudiante.
 *         tipoDocumento:
 *           type: string
 *           format: uuid
 *           description: ID de la tabla TipoDocumento.
 *         genero:
 *           type: string
 *           format: uuid
 *           description: ID de la tabla Genero.
 *         nombres:
 *           type: string
 *           description: Nombres del estudiante.
 *           example: "Ana Lucía"
 *         apellidos:
 *           type: string
 *           description: Apellidos del estudiante.
 *           example: "García Vélez"
 *         numeroDocumento:
 *           type: string
 *           description: Número de documento del estudiante.
 *           example: "1039456789"
 *         fechaNacimiento:
 *           type: string
 *           format: date-time
 *           description: Fecha de nacimiento del estudiante.
 *         correo:
 *           type: string
 *           format: email
 *           description: Correo electrónico del estudiante.
 */

import pool from '../config/db.js';
import logger from '../config/logger.js';

/**
 * @file Contiene las funciones de acceso a datos para la entidad Estudiante.
 */

/**
 * Representa los datos de entrada para registrar un nuevo estudiante a través de la función de BD.
 * @typedef {object} RegistrarEstudianteDataDB
 * @property {string} pSiglaTipoDocumento - Sigla del tipo de documento (ej. "CC").
 * @property {string} pGeneroNombre - Nombre del género (ej. "Masculino").
 * @property {string} pNombres - Nombres del estudiante.
 * @property {string} pApellidos - Apellidos del estudiante.
 * @property {string} pNumeroDocumento - Número de documento.
 * @property {string} pFechaNacimiento - Fecha de nacimiento en formato YYYY-MM-DD.
 * @property {string} pCorreo - Correo electrónico del estudiante.
 * @property {string[]} pProgramaNombres - Array de nombres de programas a los que se inscribe el estudiante.
 */

/**
 * Llama a la función de la base de datos CC.registrarestudianteuft para crear un nuevo estudiante.
 * Esta función de BD maneja la validación de IDs de tipo de documento/género/programas,
 * la generación del ID del estudiante y la inserción en tablas relacionadas.
 * @async
 * @param {RegistrarEstudianteDataDB} datosEstudiante - Los datos del estudiante a registrar.
 * @returns {Promise<{estudianteId: string | null, mensaje: string}>} Un objeto con el ID del estudiante creado y un mensaje, o null si hubo error.
 * @throws {Error} Si ocurre un error durante la ejecución de la función de BD.
 */
export const registrarEstudianteDB = async (datosEstudiante) => {
  const {
    pSiglaTipoDocumento,
    pGeneroNombre,
    pNombres,
    pApellidos,
    pNumeroDocumento,
    pFechaNacimiento,
    pCorreo,
    pProgramaNombres,
  } = datosEstudiante;

  logger.debug('[MODELO_ESTUDIANTE] Datos de entrada para registrarestudianteuft:', datosEstudiante);

  const queryString = `
    SELECT * FROM CC.registrarestudianteuft($1, $2, $3, $4, $5, $6, $7, $8);
  `;
  const values = [
    pSiglaTipoDocumento,
    pNombres,
    pApellidos,
    pNumeroDocumento,
    pCorreo,
    pGeneroNombre,
    pFechaNacimiento,
    pProgramaNombres,
  ];

  logger.debug('[MODELO_ESTUDIANTE] Llamando a CC.registrarestudianteuft con datos:', datosEstudiante);
  try {
    const { rows } = await pool.query(queryString, values);
    if (rows.length > 0) {
      const { estudianteId, mensaje } = rows[0];
      logger.info(`[MODELO_ESTUDIANTE] Resultado de registrarestudianteuft: ID=${estudianteId}, Mensaje='${mensaje}'`);
      return { estudianteId, mensaje };
    }
    logger.error('[MODELO_ESTUDIANTE] La función registrarestudianteuft no devolvió resultados.');
    throw new Error('La función de base de datos no devolvió un resultado esperado.');
  } catch (error) {
    logger.error('[MODELO_ESTUDIANTE] Error al llamar a la función CC.registrarestudianteuft:', error);
    throw error;
  }
};

/**
 * @typedef {object} ModificarEstudianteDataDB
 * @property {string} pSiglaTipoDocActual
 * @property {string} pNumeroDocActual
 * @property {string | null} pNuevosNombres
 * @property {string | null} pNuevosApellidos
 * @property {string | null} pNuevoCorreo
 * @property {string | null} pNuevaFechaNacimiento
 * @property {string | null} pNuevoNombreGenero
 * @property {string[] | null} pNuevosNombresProgramas
 */

/**
 * Llama a la función de la base de datos CC.modificarinformacionestudianteuft para actualizar un estudiante.
 * @async
 * @param {ModificarEstudianteDataDB} datos - Los datos para la modificación.
 * @returns {Promise<Array<object>>} Un array con el resultado de la función de la BD.
 * @throws {Error} Si ocurre un error durante la ejecución.
 */
export const modificarInformacionEstudiante = async (datos) => {
  const {
    pSiglaTipoDocActual,
    pNumeroDocActual,
    pNuevosNombres,
    pNuevosApellidos,
    pNuevoCorreo,
    pNuevaFechaNacimiento,
    pNuevoNombreGenero,
    pNuevosNombresProgramas,
  } = datos;

  const queryString = `
    SELECT * FROM CC.modificarinformacionestudianteuft($1, $2, $3, $4, $5, $6, $7, $8);
  `;
  const values = [
    pSiglaTipoDocActual,
    pNumeroDocActual,
    pNuevosNombres,
    pNuevosApellidos,
    pNuevoCorreo,
    pNuevaFechaNacimiento,
    pNuevoNombreGenero,
    pNuevosNombresProgramas,
  ];

  logger.debug('[MODELO_ESTUDIANTE] Llamando a CC.modificarinformacionestudianteuft');
  try {
    const { rows } = await pool.query(queryString, values);
    logger.info(`[MODELO_ESTUDIANTE] La función modificarinformacionestudianteuft devolvió ${rows.length} fila(s).`);
    return rows;
  } catch (error) {
    logger.error('[MODELO_ESTUDIANTE] Error al llamar a la función CC.modificarinformacionestudianteuft:', error);
    throw error;
  }
};

/**
 * Llama a la función de la base de datos para obtener los detalles completos de un estudiante.
 * @async
 * @param {string} siglaTipoDoc - La sigla del tipo de documento del estudiante.
 * @param {string} numeroDoc - El número de documento del estudiante.
 * @returns {Promise<Array<object>>} Un array con la fila del estudiante encontrado.
 * @throws {Error} Si ocurre un error durante la ejecución.
 */
export const obtenerInformacionCompleta = async (siglaTipoDoc, numeroDoc) => {
  const queryString = `
    SELECT * FROM cc.obtenerinformacioncompletaestudianteufs($1, $2);
  `;
  const values = [siglaTipoDoc, numeroDoc];

  logger.debug(`[MODELO_ESTUDIANTE] Llamando a cc.obtenerinformacioncompletaestudianteufs con ${siglaTipoDoc}-${numeroDoc}`);
  try {
    const { rows } = await pool.query(queryString, values);
    logger.info(`[MODELO_ESTUDIANTE] La función obtenerinformacioncompletaestudianteufs devolvió ${rows.length} fila(s).`);
    return rows;
  } catch (error) {
    logger.error('[MODELO_ESTUDIANTE] Error al llamar a la función cc.obtenerinformacioncompletaestudianteufs:', error);
    throw error;
  }
};

/**
 * Llama a la función de la base de datos para actualizar el género de un estudiante por su ID.
 * @async
 * @param {string} estudianteId - El UUID del estudiante.
 * @param {string} nuevoNombreGenero - El nuevo nombre del género.
 * @returns {Promise<object>} La primera fila del resultado de la función de BD.
 */
export const actualizarGenero = async (estudianteId, nuevoNombreGenero) => {
  const queryString = 'SELECT * FROM CC.ActualizarGeneroEstudianteUFT($1, $2);'; 
  const values = [estudianteId, nuevoNombreGenero]; 

  logger.debug(`[MODELO_ESTUDIANTE] Llamando a ActualizarGeneroEstudianteUFT con ID: ${estudianteId}`);
  try {
    const { rows } = await pool.query(queryString, values);
    return rows[0];
  } catch (error) {
    logger.error('[MODELO_ESTUDIANTE] Error al ejecutar ActualizarGeneroEstudianteUFT:', error);
    throw error;
  }
};