import { Router } from 'express';
import { verificarToken } from '../middlewares/verificarToken.middleware.js';
import { isEntrenador } from '../middlewares/verificarRoles.middleware.js';
import { manejarResultadosValidacion } from '../middlewares/validation.middleware.js';
import { validarParametroUUID } from '../utils/validaciones.utils.js';
import { body } from 'express-validator';
import { validacionesActualizarObservacion, validacionesFinalizarSesion } from '../validators/entrenamientoCognitivo.validators.js';
import * as entrenamientoCognitivoController from '../controllers/entrenamientoCognitivo.controller.js';


const router = Router();

/**
 * @swagger
 * tags:
 *   name: EntrenamientoCognitivo
 *   description: Endpoints para la gestión de entrenamientos cognitivos y estudiantes.
 */

/**
 * @swagger
 * /api/entrenamientos-cognitivos/facultad/{facultadId}/estudiantes:
 *   get:
 *     summary: Obtiene la lista de estudiantes y sus datos de entrenamiento para una facultad específica.
 *     tags: [EntrenamientoCognitivo]
 *     parameters:
 *       - in: path
 *         name: facultadId
 *         required: true
 *         description: ID de la facultad (UUID) para la cual se desean obtener los estudiantes.
 *         schema:
 *           type: string
 *           format: uuid
 *           example: a1b2c3d4-e5f6-7890-1234-567890abcdef
 *     responses:
 *       200:
 *         description: Datos de estudiantes obtenidos exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Datos de estudiantes para la facultad ID <UUID> obtenidos correctamente."
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EstudianteEntrenamientoPorFacultad'
 *       400:
 *         description: El ID de la facultad proporcionado es inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: No se encontraron estudiantes para la facultad especificada.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "No se encontraron estudiantes para la facultad con ID <UUID>."
 *                 data:
 *                   type: array
 *                   items: {}
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/facultad/:facultadId/estudiantes',
  verificarToken,
  entrenamientoCognitivoController.obtenerEstudiantesPorFacultadController 
);

/**
 * @swagger
 * /api/entrenamientos-cognitivos/estudiante/detalle-entrenamiento:
 *   post:
 *     summary: Obtiene el detalle del entrenamiento cognitivo de un estudiante por su tipo y número de documento.
 *     tags: [EntrenamientoCognitivo]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tipoDocumento
 *               - numeroDocumento
 *             properties:
 *               tipoDocumento:
 *                 type: string
 *                 description: Sigla del tipo de documento del estudiante (e.g., "CC", "TI").
 *                 example: "CC"
 *               numeroDocumento:
 *                 type: string
 *                 description: Número de documento del estudiante.
 *                 example: "1036402111"
 *     responses:
 *       200:
 *         description: Detalle del entrenamiento cognitivo obtenido exitosamente o mensaje si no se encontró.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/EntrenamientoCognitivoDetalle' 
 *       400:
 *         description: Datos de entrada inválidos (e.g., tipoDocumento o numeroDocumento faltantes o vacíos).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error' 
 *       500:
 *         description: Error del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/estudiante/detalle-entrenamiento',
  verificarToken,
  entrenamientoCognitivoController.obtenerEntrenamientoEstudiantePorDocumentoController
);

/**
 * @swagger
 * /api/entrenamientos-cognitivos/crear:
 *   post:
 *     summary: Registra un nuevo entrenamiento cognitivo para un estudiante.
 *     tags: [EntrenamientoCognitivo]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - siglaTipoDocEstudiante
 *               - numeroDocEstudiante
 *               - siglaTipoDocEntrenador
 *               - numeroDocEntrenador
 *               - fechaFinEntrenamiento
 *               - variablesCognitivas
 *             properties:
 *               siglaTipoDocEstudiante:
 *                 type: string
 *                 description: Sigla del tipo de documento del estudiante (ej. "CC", "TI").
 *                 example: "CC"
 *               numeroDocEstudiante:
 *                 type: string
 *                 description: Número de documento del estudiante.
 *                 example: "1012345678"
 *               siglaTipoDocEntrenador:
 *                 type: string
 *                 description: Sigla del tipo de documento del entrenador.
 *                 example: "TI"
 *               numeroDocEntrenador:
 *                 type: string
 *                 description: Número de documento del entrenador.
 *                 example: "987654321"
 *               fechaFinEntrenamiento:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha y hora de finalización del entrenamiento en formato "YYYY-MM-DD HH:MM:SS".
 *                 example: "2025-12-31 23:59:59"
 *               variablesCognitivas:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array de nombres de las variables cognitivas a entrenar.
 *                 example: ["Atención Sostenida", "Memoria de Trabajo"]
 *     responses:
 *       201:
 *         description: Entrenamiento cognitivo registrado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Entrenamiento cognitivo registrado exitosamente.
 *                 data:
 *                   type: object
 *                   properties:
 *                     siglaTipoDocEstudiante: { type: string }
 *                     numeroDocEstudiante: { type: string }
 *                     siglaTipoDocEntrenador: { type: string }
 *                     numeroDocEntrenador: { type: string }
 *                     fechaFinEntrenamiento: { type: string, format: "date-time" }
 *                     variablesCognitivas: { type: array, items: { type: string } }
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       description: El UUID del entrenamiento recién creado.
 *                     mensajeBD:
 *                       type: string
 *                       description: Mensaje devuelto por la función de la base de datos.
 *                       example: "Entrenamiento cognitivo registrado exitosamente."
 *       400:
 *         description: Datos de entrada inválidos o faltantes, o entidad no encontrada (estudiante, entrenador, variable cognitiva).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Conflicto, el entrenamiento ya existe o hay una regla de negocio violada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/crear',
  verificarToken,
  entrenamientoCognitivoController.crearNuevoEntrenamientoCognitivoController
);

/**
 * @swagger
 * /api/entrenamientos-cognitivos/asignacion:
 *   post:
 *     summary: Registra un nuevo entrenamiento y su asignación de variable cognitiva inicial.
 *     tags: [EntrenamientoCognitivo]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - estudianteId
 *               - fechaInicio
 *               - tiposVariablesCognitivasIds
 *               - nivelInicial
 *               - metricas
 *             properties:
 *               estudianteId:
 *                 type: string
 *                 format: uuid
 *                 description: ID del estudiante al que se le asigna el entrenamiento.
 *                 example: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
 *               fechaInicio:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha de inicio del entrenamiento en formato 'YYYY-MM-DD HH:MM:SS'.
 *                 example: "2024-05-21 10:00:00"
 *               tiposVariablesCognitivasIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: Array de IDs de los tipos de variables cognitivas a asignar.
 *                 example: ["a1b2c3d4-e5f6-7890-1234-567890abcde0", "a1b2c3d4-e5f6-7890-1234-567890abcde1"]
 *               nivelInicial:
 *                 type: object
 *                 description: Objeto JSON que describe el nivel inicial.
 *                 example: {"dificultad": "baja", "items": 5}
 *               metricas:
 *                 type: object
 *                 description: Objeto JSON que describe las métricas iniciales.
 *                 example: {"precision_objetivo": 95, "tiempo_maximo": 120}
 *     responses:
 *       201:
 *         description: Entrenamiento y asignación creados con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Entrenamiento y asignaciones de variables creados con éxito."
 *       400:
 *         description: Datos de entrada inválidos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Se debe proporcionar al menos un ID de tipo de variable cognitiva en un arreglo."
 *       500:
 *         description: Error interno del servidor.
 */
router.post(
    '/asignacion',
    verificarToken,
    entrenamientoCognitivoController.registrarEntrenamientoAsignacionController
);

/**
 * @swagger
 * /api/entrenamientos-cognitivos/progreso/{asignacionId}:
 *   get:
 *     summary: Obtiene el detalle de progreso de una variable cognitiva asignada específica.
 *     tags: [EntrenamientoCognitivo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: asignacionId
 *         required: true
 *         description: ID de la asignación de la variable (UUID).
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Detalles del progreso obtenidos exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/ProgresoVariableDetalle' # Necesitarás definir este schema en tu config de swagger
 *       400:
 *         description: ID de asignación inválido.
 *       401:
 *         description: No autorizado (token no válido).
 *       403:
 *         description: Prohibido (rol no permitido).
 *       404:
 *         description: No se encontraron detalles de progreso para el ID proporcionado.
 *       500:
 *         description: Error interno del servidor.
 */
router.get(
  '/progreso/:asignacionId',
  verificarToken,
  isEntrenador, 
  validarParametroUUID('asignacionId'),
  manejarResultadosValidacion,
  entrenamientoCognitivoController.obtenerProgresoVariableController
);

/**
 * @swagger
 * /api/entrenamientos-cognitivos/estudiante/{siglaTipoDocEstudiante}/{numeroDocEstudiante}:
 *   patch:
 *     summary: Modifica un entrenamiento cognitivo existente de un estudiante.
 *     tags: [EntrenamientoCognitivo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: siglaTipoDocEstudiante
 *         required: true
 *         schema:
 *           type: string
 *         description: Sigla del tipo de documento del estudiante cuyo entrenamiento se va a modificar.
 *         example: "CC"
 *       - in: path
 *         name: numeroDocEstudiante
 *         required: true
 *         schema:
 *           type: string
 *         description: Número de documento del estudiante cuyo entrenamiento se va a modificar.
 *         example: "1012345678"
 *     requestBody:
 *       description: "Objeto con los campos a actualizar. Solo es necesario incluir los campos que se desean cambiar."
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               variablesAAgregar:
 *                 type: array
 *                 items: { type: string }
 *                 description: Lista de nombres de variables cognitivas a añadir al entrenamiento.
 *                 example: ["Velocidad de Procesamiento"]
 *               variablesARemover:
 *                 type: array
 *                 items: { type: string }
 *                 description: Lista de nombres de variables cognitivas a quitar del entrenamiento.
 *                 example: ["Memoria de Trabajo"]
 *               siglaTipoDocNuevoEntrenador:
 *                 type: string
 *                 description: Sigla del tipo de documento del nuevo entrenador. Debe ir junto con el número.
 *                 example: "CC"
 *               numeroDocNuevoEntrenador:
 *                 type: string
 *                 description: Número de documento del nuevo entrenador. Debe ir junto con la sigla.
 *                 example: "9876543210"
 *               nuevaFechaFinEntrenamiento:
 *                 type: string
 *                 format: date-time
 *                 description: Nueva fecha de finalización para el entrenamiento, en formato "YYYY-MM-DD HH:MM:SS".
 *                 example: "2026-01-15 18:00:00"
 *     responses:
 *       200:
 *         description: Entrenamiento cognitivo actualizado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Entrenamiento cognitivo actualizado exitosamente."
 *                 data:
 *                   type: object
 *                   properties:
 *                     entrenamientoId:
 *                       type: string
 *                       format: uuid
 *                     detalles:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: "Variable 'Memoria de Trabajo' y sus sesiones eliminadas."
 *       400:
 *         description: Error de validación (ej. falta un parámetro, la variable a remover no existe).
 *       401:
 *         description: No autorizado (token no válido).
 *       403:
 *         description: Prohibido (rol no permitido).
 *       404:
 *         description: Estudiante no encontrado o no tiene un entrenamiento cognitivo.
 *       500:
 *         description: Error interno del servidor.
 */
router.patch(
  '/estudiante/:siglaTipoDocEstudiante/:numeroDocEstudiante',
  verificarToken,
  isEntrenador,
  entrenamientoCognitivoController.modificarEntrenamientoCognitivoController
);


/**
 * @swagger
 * /api/entrenamientos-cognitivos/sesiones/{idSesion}/observacion:
 *   put:
 *     summary: Actualiza la observación de una sesión de entrenamiento específica.
 *     tags: [EntrenamientoCognitivo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idSesion
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: El ID de la sesión de entrenamiento.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nuevaObservacion
 *             properties:
 *               nuevaObservacion:
 *                 type: string
 *                 description: El nuevo texto para la observación.
 *                 example: "El estudiante mostró gran concentración durante esta sesión."
 *     responses:
 *       '200':
 *         description: Observación actualizada exitosamente.
 *       '400':
 *         description: Datos inválidos (ID no es UUID, observación no es string, o la sesión no se puede modificar).
 *       '401':
 *         description: No autorizado.
 *       '403':
 *         description: Prohibido (rol no es Entrenador).
 *       '500':
 *         description: Error interno del servidor.
 */
router.put(
  '/sesiones/:idSesion/observacion',
  verificarToken,
  isEntrenador,
  validarParametroUUID('idSesion'), 
  validacionesActualizarObservacion,
  manejarResultadosValidacion,
  entrenamientoCognitivoController.actualizarObservacionSesionController
);

/**
 * @swagger
 * /api/entrenamientos-cognitivos/sesiones/{idSesion}/finalizar:
 *   put:
 *     summary: Finaliza una sesión de entrenamiento y actualiza métricas y nivel inicial.
 *     tags: [EntrenamientoCognitivo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idSesion
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: El ID de la sesión de entrenamiento a finalizar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nuevasMetricas
 *               - nuevoNivelInicial
 *             properties:
 *               nuevasMetricas:
 *                 type: object
 *                 description: Objeto JSON con las nuevas métricas de la sesión.
 *                 example: {"precision": 85, "tiempo_respuesta": 120, "errores": 3}
 *               nuevoNivelInicial:
 *                 type: object
 *                 description: Objeto JSON con el nuevo nivel inicial del estudiante.
 *                 example: {"dificultad": "media", "nivel": 2, "puntuacion": 750}
 *     responses:
 *       '200':
 *         description: Sesión finalizada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Sesión de entrenamiento finalizada. Métricas y nivel inicial actualizados exitosamente."
 *                 data:
 *                   type: object
 *                   properties:
 *                     idSesion:
 *                       type: string
 *                       format: uuid
 *                     detalles:
 *                       type: array
 *                       items:
 *                         type: string
 *       '400':
 *         description: Datos inválidos o sesión no se puede finalizar.
 *       '401':
 *         description: No autorizado.
 *       '403':
 *         description: Prohibido (rol no es Entrenador).
 *       '500':
 *         description: Error interno del servidor.
 */
router.put(
  '/sesiones/:idSesion/finalizar',
  verificarToken,
  isEntrenador,
  validarParametroUUID('idSesion'),
  validacionesFinalizarSesion,
  manejarResultadosValidacion,
  entrenamientoCognitivoController.finalizarSesionController
);

/**
 * @swagger
 * /api/entrenamientos-cognitivos/asignaciones/{idAsignacion}/finalizar:
 *   put:
 *     summary: Finaliza una asignación de variable cognitiva cambiando su estado a "Finalizado".
 *     tags: [EntrenamientoCognitivo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idAsignacion
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: El ID de la asignación de variable a finalizar.
 *     responses:
 *       '200':
 *         description: Asignación de variable finalizada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Asignación de variable [UUID] marcada como \"Finalizado\" exitosamente."
 *                 data:
 *                   type: object
 *                   properties:
 *                     asignacionId:
 *                       type: string
 *                       format: uuid
 *                     detalles:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["El trigger correspondiente se encargará de actualizar el estado del entrenamiento cognitivo general si todas las demás variables activas también están finalizadas."]
 *       '400':
 *         description: Datos inválidos o asignación no se puede finalizar (ej. no está en estado "En Progreso").
 *       '401':
 *         description: No autorizado.
 *       '403':
 *         description: Prohibido (rol no es Entrenador).
 *       '404':
 *         description: Asignación de variable no encontrada.
 *       '500':
 *         description: Error interno del servidor.
 */
router.put(
  '/asignaciones/:idAsignacion/finalizar',
  verificarToken,
  isEntrenador,
  validarParametroUUID('idAsignacion'),
  manejarResultadosValidacion,
  entrenamientoCognitivoController.finalizarAsignacionVariableController
);

export default router; 