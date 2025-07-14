/**
 * @swagger
 * components:
 *   schemas:
 *     InformeEntrenador:
 *       type: object
 *       properties:
 *         entrenamientoid:
 *           type: string
 *           format: uuid
 *         estudiantenombres:
 *           type: string
 *         estudianteapellidos:
 *           type: string
 *         estudiantetipodocumento:
 *           type: string
 *         estudiantenumerodocumento:
 *           type: string
 *         estadoentrenamiento:
 *           type: string
 *         fechainicioentrenamiento:
 *           type: string
 *           format: date-time
 *     DetalleInformeAdmin:
 *       type: object
 *       properties:
 *         entrenamiento_id:
 *           type: string
 *           format: uuid
 *         nombre_estudiante:
 *           type: string
 *         apellido_estudiante:
 *           type: string
 *         # ...añade aquí el resto de las propiedades de la vista InformeVariablesFinalizadasPorEntrenamientoUV
 *         variables_finalizadas:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               nombre_variable:
 *                 type: string
 *               estado_variable:
 *                 type: string
 *               fecha_asignacion:
 *                 type: string
 *                 format: date-time
 *               fecha_finalizacion:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 */

import pool from '../config/db.js';
import logger from '../config/logger.js';

/**
 * @file Contiene las funciones de acceso a datos para los informes de administración.
 */

/**
 * Obtiene la lista de todos los entrenamientos cognitivos para la vista de administración.
 * Utiliza la vista CC.AdminListaEntrenamientosUV.
 * @async
 * @returns {Promise<Array<object>>} Un array con los objetos de los entrenamientos.
 * @throws {Error} Si ocurre un error durante la consulta a la base de datos.
 */
export const obtenerListaEntrenamientosAdmin = async () => {
  const queryString = 'SELECT * FROM CC.AdminListaEntrenamientosUV ORDER BY fechainicioentrenamiento DESC, estudianteapellidos, estudiantenombres;';
  // Se añadió un ORDER BY para consistencia en la presentación
  logger.debug('[MODELO_INFORME] Ejecutando obtenerListaEntrenamientosAdmin con query: %s', queryString);
  try {
    const { rows } = await pool.query(queryString);
    logger.info(`[MODELO_INFORME] Se encontraron ${rows.length} entrenamientos para la lista de administración.`);
    return rows;
  } catch (error) {
    logger.error('[MODELO_INFORME] Error al listar entrenamientos para admin desde la BD:', error);
    throw error; // Relanzar para que el servicio lo maneje
  }
};

/**
 * Obtiene el detalle de las variables finalizadas para un entrenamiento cognitivo específico.
 * Utiliza la vista CC.InformeVariablesFinalizadasPorEntrenamientoUV.
 * @async
 * @param {string} entrenamientoId - El UUID del entrenamiento cognitivo.
 * @returns {Promise<Array<object>>} Un array con los detalles de las variables finalizadas para el entrenamiento.
 * Puede estar vacío si no hay variables finalizadas o el entrenamiento no existe.
 * @throws {Error} Si ocurre un error durante la consulta a la base de datos.
 */
export const obtenerDetalleInformeEntrenamiento = async (entrenamientoId) => {
  const queryString = 'SELECT * FROM CC.InformeVariablesFinalizadasPorEntrenamientoUV WHERE entrenamientoId = $1 ORDER BY variablecognitivanombre;';
  logger.debug('[MODELO_INFORME] Ejecutando obtenerDetalleInformeEntrenamiento con query: %s y ID: %s', queryString, entrenamientoId);
  try {
    const { rows } = await pool.query(queryString, [entrenamientoId]);
    logger.info(`[MODELO_INFORME] Se encontraron ${rows.length} variables finalizadas para el informe del entrenamiento ID: ${entrenamientoId}.`);
    return rows;
  } catch (error) {
    logger.error(`[MODELO_INFORME] Error al obtener detalle de informe para entrenamiento ID ${entrenamientoId} desde la BD:`, error);
    throw error; // Relanzar para que el servicio lo maneje
  }
};



/**
 * Obtiene la lista de entrenamientos asignados a un entrenador específico.
 * Utiliza la vista CC.EntrenadorInformeEntrenamientosUV.
 * @async
 * @param {string} entrenadorId - El UUID del entrenador.
 * @returns {Promise<Array<object>>} Un array con los objetos de los entrenamientos.
 * @throws {Error} Si ocurre un error durante la consulta a la base de datos.
 */
export const obtenerListaEntrenamientosEntrenador = async (entrenadorId) => {
  // Usamos el nuevo nombre de la vista que definiste
  const queryString = 'SELECT * FROM CC.EntrenadorInformesPorFacultadUV WHERE entrenadorId = $1;';
  logger.debug('[MODELO_INFORME] Ejecutando obtenerListaEntrenamientosParaEntrenador con ID: %s', entrenadorId);
  try {
    const { rows } = await pool.query(queryString, [entrenadorId]);
    logger.info(`[MODELO_INFORME] Se encontraron ${rows.length} entrenamientos para el entrenador ID: ${entrenadorId}.`);
    return rows;
  } catch (error) {
    logger.error(`[MODELO_INFORME] Error al listar entrenamientos para entrenador desde la BD:`, error);
    throw error;
  }
};