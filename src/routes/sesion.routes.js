import { Router } from 'express';
import { verificarToken } from '../middlewares/verificarToken.middleware.js';
import { isEntrenador } from '../middlewares/verificarRoles.middleware.js';
import { manejarResultadosValidacion } from '../middlewares/validation.middleware.js';
import { validarParametroUUID } from '../utils/validaciones.utils.js';
import { body } from 'express-validator';
import * as sesionController from '../controllers/sesion.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Sesiones
 *   description: Endpoints para la gestión de sesiones de entrenamiento.
 */

/**
 * @swagger
 * /api/sesiones/crear:
 *   post:
 *     summary: Crea una nueva sesión de entrenamiento para una variable cognitiva específica.
 *     tags: [Sesiones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               siglaTipoDocEstudiante:
 *                 type: string
 *                 example: "CC"
 *               numeroDocEstudiante:
 *                 type: string
 *                 example: "1036402111"
 *               nombreVariableCognitiva:
 *                 type: string
 *                 example: "Lectura Critica"
 *               fechaInicio:
 *                 type: string
 *                 format: date-time
 *                 description: "Fecha y hora de inicio. Si se omite, se usa la actual."
 *                 example: "2025-06-20T10:00:00"
 *     responses:
 *       201:
 *         description: Sesión creada exitosamente.
 *       400:
 *         description: Datos de entrada inválidos.
 *       403:
 *         description: El usuario no tiene el rol de Entrenador.
 *       404:
 *         description: Estudiante o variable no encontrados.
 */
router.post(
    '/crear',
    verificarToken,
    isEntrenador,
    sesionController.crearSesion
);

/**
 * @swagger
 * /api/sesiones/{idSesion}/iniciar:
 *   post:
 *     summary: Inicia una sesión de entrenamiento que está 'Por Iniciar'.
 *     tags: [Sesiones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idSesion
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Sesión iniciada exitosamente.
 *       400:
 *         description: La sesión no se puede iniciar (ej. ya está iniciada o finalizada).
 *       404:
 *         description: Sesión no encontrada.
 */
router.post(
    '/:idSesion/iniciar',
    verificarToken,
    isEntrenador,
    validarParametroUUID('idSesion'),
    manejarResultadosValidacion,
    sesionController.iniciarSesion
);

export default router;