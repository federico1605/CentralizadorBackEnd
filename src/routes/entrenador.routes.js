import { Router } from 'express';
import { obtenerFacultadesPorEmailController, obtenerDatosPorCorreoController, crearEntrenadorEntrenamientoController } from '../controllers/entrenador.controller.js';
import { verificarToken } from '../middlewares/verificarToken.middleware.js'; 
import { isEntrenador } from '../middlewares/verificarRoles.middleware.js';
import { obtenerListaEntrenamientosEntrenador, obtenerDetalleInformeAdmin } from '../controllers/informe.controller.js';
import { validarParametroUUID } from '../utils/validaciones.utils.js';
import { manejarResultadosValidacion } from "../middlewares/validation.middleware.js";

/**
 * @file Contiene las rutas para las operaciones relacionadas con la entidad Entrenador.
 */

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Entrenadores
 *   description: Endpoints para la gestión de entrenadores y sus facultades.
 */

/**
 * @swagger
 * /api/entrenadores/facultad-entrenador/{correo}:
 *   get:
 *     summary: Obtiene las facultades asociadas a un entrenador por su correo electrónico.
 *     tags: [Entrenadores]
 *     parameters:
 *       - in: path
 *         name: correo
 *         required: true
 *         description: Correo electrónico del entrenador.
 *         schema:
 *           type: string
 *           format: email
 *           example: entrenador@example.com
 *     responses:
 *       200:
 *         description: Lista de facultades asociadas al entrenador.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   facultad_id:
 *                     type: string
 *                     format: uuid
 *                     description: ID de la facultad.
 *                     example: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
 *                   nombre_facultad:
 *                     type: string
 *                     description: Nombre de la facultad.
 *                     example: "Facultad de Ingeniería"
 *       400:
 *         description: Correo electrónico inválido.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Correo electrónico inválido."
 *       404:
 *         description: No se encontraron facultades para el entrenador con el correo proporcionado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No se encontraron facultades para el entrenador con el correo proporcionado."
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error interno del servidor al obtener facultades."
 *                 error:
 *                   type: string
 *                   example: "Detalle del error."
 */
router.get('/facultad-entrenador/:correo', verificarToken, obtenerFacultadesPorEmailController);


/**
 * @swagger
 * /api/entrenadores/datosporcorreo/{correo}:
 *   get:
 *     summary: Obtiene los datos de un entrenador por su correo electrónico.
 *     tags: [Entrenadores]
 *     parameters:
 *       - in: path
 *         name: correo
 *         required: true
 *         description: Correo electrónico del entrenador.
 *         schema:
 *           type: string
 *           format: email
 *           example: "monica.melendez@uco.edu.co"
 *     responses:
 *       200:
 *         description: Datos del entrenador obtenidos exitosamente.
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
 *                   example: "Datos del entrenador obtenidos exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     numeroDocumento:
 *                       type: string
 *                       description: Número de documento del entrenador.
 *                       example: "123456789"
 *                     siglaTipoDocumento:
 *                       type: string
 *                       description: Sigla del tipo de documento.
 *                       example: "CC"
 *                     nombres:
 *                       type: string
 *                       description: Nombres del entrenador.
 *                       example: "Juan Carlos"
 *                     apellidos:
 *                       type: string
 *                       description: Apellidos del entrenador.
 *                       example: "Pérez García"
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
 *                   example: "El correo electrónico debe tener un formato válido."
 *       404:
 *         description: No se encontró un entrenador con el correo proporcionado.
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
 *                   example: "No se encontró un entrenador con el correo electrónico proporcionado."
 *       500:
 *         description: Error interno del servidor.
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
 *                   example: "Error interno del servidor."
 */
router.get('/datosporcorreo/:correo', verificarToken, obtenerDatosPorCorreoController);


/**
 * @swagger
 * /api/entrenadores/informes:
 *   get:
 *     summary: Obtiene la lista de entrenamientos asignados al entrenador autenticado.
 *     tags: [InformesEntrenador]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista de entrenamientos obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lista de entrenamientos asignados obtenida exitosamente."
 *                 total:
 *                   type: integer
 *                   example: 1
 *                 entrenamientos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       entrenamientoid:
 *                         type: string
 *                         format: uuid
 *                         description: ID del entrenamiento cognitivo.
 *                       estudiantenombres:
 *                         type: string
 *                         description: Nombres del estudiante.
 *                         example: "Pedro León"
 *                       estudianteapellidos:
 *                         type: string
 *                         description: Apellidos del estudiante.
 *                         example: "García Pérez"
 *                       estudiantetipodocumento:
 *                         type: string
 *                         description: Sigla del tipo de documento del estudiante.
 *                         example: "CC"
 *                       estudiantenumerodocumento:
 *                         type: string
 *                         description: Número de documento del estudiante.
 *                         example: "1036402111"
 *                       estadoentrenamiento:
 *                         type: string
 *                         description: Estado actual del entrenamiento.
 *                         example: "Por Iniciar"
 *                       fechainicioentrenamiento:
 *                         type: string
 *                         format: date-time
 *                         description: Fecha de inicio del entrenamiento.
 *       '401':
 *         description: No autorizado. El token no fue proporcionado o es inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '403':
 *         description: Acceso prohibido. El usuario no tiene el rol de 'Entrenador'.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '500':
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/informes', verificarToken, isEntrenador, obtenerListaEntrenamientosEntrenador);



/**
 * @swagger
 * /api/entrenadores/informes/{entrenamientoId}:
 *   get:
 *     summary: Obtiene el detalle de un informe de entrenamiento si pertenece al entrenador autenticado.
 *     tags: [InformesEntrenador]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entrenamientoId
 *         required: true
 *         description: ID del entrenamiento (UUID) para el cual se desea obtener el detalle.
 *         schema:
 *           type: string
 *           format: uuid
 *           example: a1b2c3d4-e5f6-7890-1234-567890abcdef
 *     responses:
 *       200:
 *         description: Detalle del informe de entrenamiento obtenido exitosamente.
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
 *                   example: "Detalle del entrenamiento <UUID> obtenido correctamente."
 *                 data:
 *                   type: object
 *                   properties:
 *                     entrenamiento_id: { type: 'string', format: 'uuid' }
 *                     nombre_estudiante: { type: 'string' }
 *                     apellido_estudiante: { type: 'string' }
 *                     numero_documento_estudiante: { type: 'string' }
 *                     tipo_documento_estudiante_sigla: { type: 'string' }
 *                     nombre_entrenador: { type: 'string' }
 *                     apellido_entrenador: { type: 'string' }
 *                     facultad_nombre: { type: 'string' }
 *                     programa_nombre: { type: 'string' }
 *                     fecha_inicio: { type: 'string', format: 'date-time' }
 *                     fecha_fin: { type: 'string', format: 'date-time', nullable: true }
 *                     estado_entrenamiento: { type: 'string' }
 *                     variables_finalizadas:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           nombre_variable:
 *                             type: string
 *                           estado_variable:
 *                             type: string
 *                           fecha_asignacion:
 *                             type: string
 *                             format: date-time
 *                           fecha_finalizacion:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autorizado. El token no fue proporcionado o es inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acceso prohibido, el informe no pertenece a este entrenador.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Entrenamiento no encontrado o no se encontraron variables finalizadas.
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
 *                   example: "No se encontró el entrenamiento con ID <UUID> o no se encontraron variables finalizadas para este entrenamiento."
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/informes/:entrenamientoId', verificarToken, isEntrenador, validarParametroUUID('entrenamientoId'), manejarResultadosValidacion, obtenerDetalleInformeAdmin);


/**
 * @swagger
 * /api/entrenadores/asignar-entrenamiento:
 *   post:
 *     summary: Crea una relación entre un entrenador y un entrenamiento cognitivo.
 *     tags: [Entrenadores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - entrenadorId
 *               - entrenamientoCognitivoId
 *             properties:
 *               entrenadorId:
 *                 type: string
 *                 format: uuid
 *                 description: UUID del entrenador a asignar.
 *                 example: "d9428888-122b-11e1-b85c-61cd3cbb3210"
 *               entrenamientoCognitivoId:
 *                 type: string
 *                 format: uuid
 *                 description: UUID del entrenamiento cognitivo a asignar.
 *                 example: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
 *     responses:
 *       201:
 *         description: Relación entrenador-entrenamiento creada exitosamente.
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
 *                   example: "Relación entrenador-entrenamiento creada exitosamente."
 *                 data:
 *                   type: object
 *                   properties:
 *                     relacionId:
 *                       type: string
 *                       format: uuid
 *                       description: ID de la relación creada.
 *                       example: "2e67debb-69cc-47bc-b960-b57d6a7ec906"
 *                     entrenadorId:
 *                       type: string
 *                       format: uuid
 *                       description: ID del entrenador asignado.
 *                       example: "d9428888-122b-11e1-b85c-61cd3cbb3210"
 *                     entrenamientoCognitivoId:
 *                       type: string
 *                       format: uuid
 *                       description: ID del entrenamiento cognitivo asignado.
 *                       example: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
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
 *                   example: "El ID del entrenador es requerido y debe ser una cadena de texto no vacía."
 *       404:
 *         description: Uno de los IDs proporcionados no existe.
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
 *                   example: "El ID del entrenador proporcionado no existe en la base de datos."
 *       409:
 *         description: Ya existe una relación entre este entrenador y este entrenamiento.
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
 *                   example: "Ya existe una relación entre este entrenador y este entrenamiento cognitivo."
 *       500:
 *         description: Error interno del servidor.
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
 *                   example: "Error interno del servidor."
 */
router.post('/asignar-entrenamiento', verificarToken, crearEntrenadorEntrenamientoController);


export default router; 