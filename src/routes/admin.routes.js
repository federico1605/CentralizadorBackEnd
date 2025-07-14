import { Router } from "express";
import { param } from "express-validator";
import { listarTodosLosEntrenadores, registrarEntrenador, actualizarInformacionEntrenador, desactivarEntrenador } from "../controllers/entrenador.controller.js";
import { verificarToken } from "../middlewares/verificarToken.middleware.js";
import { isAdmin } from "../middlewares/verificarRoles.middleware.js";
import { validacionesRegistroEntrenador, validacionesCompletasActualizarEntrenador, validacionesDesactivarEntrenador} from "../validators/admin.validators.js";
import { manejarResultadosValidacion } from "../middlewares/validation.middleware.js";
import { obtenerListaEntrenamientosAdmin, obtenerDetalleInformeAdmin } from "../controllers/informe.controller.js";
import { validarParametroUUID } from "../utils/validaciones.utils.js";

// Enrutador de Express
const router = Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Endpoints para la gestión de administradores (entrenadores).
 */

/**
 * @swagger
 * /api/admin/entrenadores:
 *   post:
 *     summary: Registra un nuevo entrenador en el sistema.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - siglaTipoDocumento
 *               - numeroDocumento
 *               - nombres
 *               - apellidos
 *               - correo
 *               - nombresFacultades
 *             properties:
 *               siglaTipoDocumento:
 *                 type: string
 *                 description: Sigla del tipo de documento del entrenador (ej. "CC", "TI").
 *                 example: "CC"
 *               numeroDocumento:
 *                 type: string
 *                 description: Número de documento único del entrenador.
 *                 example: "1012345678"
 *               nombres:
 *                 type: string
 *                 description: Nombres del entrenador.
 *                 example: "Carlos Andres"
 *               apellidos:
 *                 type: string
 *                 description: Apellidos del entrenador.
 *                 example: "Ramirez Gomez"
 *               correo:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico único del entrenador.
 *                 example: "carlos.ramirez@example.com"
 *               nombresFacultades:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Lista con los nombres de las facultades a las que se asignará. Debe contener al menos una.
 *                 example: ["Ingenierías", "Ciencias Sociales"]
 *               fechaFin:
 *                 type: string
 *                 format: date
 *                 description: "Opcional. Fecha de finalización del contrato. Por defecto, 6 meses desde hoy."
 *                 example: "2026-01-31"
 *     responses:
 *       201:
 *         description: Entrenador registrado exitosamente.
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 *       409:
 *         description: Conflicto, el entrenador ya existe (documento o correo duplicado).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.post("/entrenadores", verificarToken, isAdmin, validacionesRegistroEntrenador, manejarResultadosValidacion, registrarEntrenador);

/**
 * @swagger
 * /api/admin/entrenadores:
 *   get:
 *     summary: Obtiene la lista de todos los entrenadores.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de entrenadores obtenida exitosamente.
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
 *                   example: "Entrenadores obtenidos exitosamente."
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       idEntrenador:
 *                         type: string
 *                         format: uuid
 *                       tipoDocumentoEntrenador:
 *                         type: string
 *                       numeroDocumentoEntrenador:
 *                         type: string
 *                       nombresEntrenador:
 *                         type: string
 *                       apellidosEntrenador:
 *                         type: string
 *                       correoEntrenador:
 *                         type: string
 *                         format: email
 *                       fechaInicioContrato:
 *                         type: string
 *                         format: date-time
 *                       fechaFinContrato:
 *                         type: string
 *                         format: date-time
 *                       estadoContrato:
 *                         type: string
 *                         example: "Activo"
 *                       facultadesAsignadas:
 *                         type: array
 *                         items:
 *                           type: string
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.get("/entrenadores", verificarToken, isAdmin, listarTodosLosEntrenadores);

/**
 * @swagger
 * /api/admin/entrenadores/{entrenadorID}:
 *   put:
 *     summary: Actualiza la información de un entrenador existente.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entrenadorID
 *         required: true
 *         description: ID del entrenador (UUID) a modificar.
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "b5f8db27-c5e0-4764-a7c8-9f7eb42302a1"
 *     requestBody:
 *       description: "Objeto con los campos a actualizar. Solo es necesario incluir los campos que se desean cambiar."
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pNuevosNombres:
 *                 type: string
 *                 description: Los nuevos nombres del entrenador.
 *                 example: "Carlos Alberto"
 *               pNuevosApellidos:
 *                 type: string
 *                 description: Los nuevos apellidos del entrenador.
 *                 example: "Gomez Ramirez"
 *               pNuevoCorreo:
 *                 type: string
 *                 format: email
 *                 description: El nuevo correo electrónico del entrenador.
 *                 example: "c.ramirez@example.com"
 *               pNuevaFechaFin:
 *                 type: string
 *                 format: date
 *                 description: La nueva fecha de finalización del contrato.
 *                 example: "2027-12-31"
 *               pNuevosNombresFacultades:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Reemplazo completo de la lista de facultades del entrenador.
 *                 example: ["Ingenierías"]
 *     responses:
 *       200:
 *         description: Entrenador actualizado exitosamente.
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         description: Entrenador no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.put('/entrenadores/:entrenadorID', verificarToken, isAdmin, validacionesCompletasActualizarEntrenador, manejarResultadosValidacion, actualizarInformacionEntrenador);

/**
 * @swagger
 * /api/admin/entrenadores/{entrenadorID}/desactivar:
 *   put:
 *     summary: Desactiva un entrenador existente.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entrenadorID
 *         required: true
 *         description: ID del entrenador (UUID) a desactivar.
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
 *     responses:
 *       200:
 *         description: Entrenador desactivado exitosamente.
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
 *                   example: "Entrenador desactivado exitosamente."
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         description: Entrenador no encontrado.
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
 *                   example: "El entrenador con ID <UUID> no fue encontrado."
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.put('/entrenadores/:entrenadorID/desactivar', verificarToken, isAdmin, validacionesDesactivarEntrenador, manejarResultadosValidacion, desactivarEntrenador);


/**
 * @swagger
 * /api/admin/informes/entrenamientos:
 *   get:
 *     summary: Obtiene la lista de todos los entrenamientos para la vista de informes del administrador.
 *     tags: [InformesAdmin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de entrenamientos obtenida exitosamente.
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
 *                   example: "Lista de entrenamientos obtenida exitosamente."
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       entrenamiento_id: { type: 'string', format: 'uuid' }
 *                       nombre_estudiante: { type: 'string' }
 *                       apellido_estudiante: { type: 'string' }
 *                       numero_documento_estudiante: { type: 'string' }
 *                       tipo_documento_estudiante_sigla: { type: 'string' }
 *                       fecha_inicio: { type: 'string', format: 'date-time' }
 *                       fecha_fin: { type: 'string', format: 'date-time', nullable: true }
 *                       estado: { type: 'string' }
 *                       nombre_entrenador: { type: 'string' }
 *                       apellido_entrenador: { type: 'string' }
 *                       facultad_nombre: { type: 'string' }
 *                       programa_nombre: { type: 'string' }
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/informes/entrenamientos', verificarToken, isAdmin, obtenerListaEntrenamientosAdmin);

/**
 * @swagger
 * /api/admin/informes/entrenamientos/{entrenamientoId}:
 *   get:
 *     summary: Obtiene el detalle de un informe de entrenamiento específico (variables finalizadas).
 *     tags: [InformesAdmin]
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
 *                       entrenamiento_id: { type: 'string', format: 'uuid' }
 *                       nombre_estudiante: { type: 'string' }
 *                       apellido_estudiante: { type: 'string' }
 *                       numero_documento_estudiante: { type: 'string' }
 *                       tipo_documento_estudiante_sigla: { type: 'string' }
 *                       nombre_entrenador: { type: 'string' }
 *                       apellido_entrenador: { type: 'string' }
 *                       facultad_nombre: { type: 'string' }
 *                       programa_nombre: { type: 'string' }
 *                       fecha_inicio: { type: 'string', format: 'date-time' }
 *                       fecha_fin: { type: 'string', format: 'date-time', nullable: true }
 *                       estado_entrenamiento: { type: 'string' }
 *                       variables_finalizadas:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             nombre_variable: 
 *                               type: string
 *                             estado_variable:
 *                               type: string
 *                             fecha_asignacion:
 *                               type: string
 *                               format: date-time
 *                             fecha_finalizacion:
 *                               type: string
 *                               format: date-time
 *                               nullable: true
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         description: No se encontró el entrenamiento especificado o no se encontraron variables finalizadas.
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
router.get('/informes/entrenamientos/:entrenamientoId', verificarToken, isAdmin, validarParametroUUID('entrenamientoId'), manejarResultadosValidacion, obtenerDetalleInformeAdmin);


export default router;
