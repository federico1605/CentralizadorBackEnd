import { Router } from 'express';
import { body, param } from 'express-validator';
import * as estudianteController from '../controllers/estudiante.controller.js';
import { validarParametroUUID } from '../utils/validaciones.utils.js';
import { manejarResultadosValidacion } from "../middlewares/validation.middleware.js";
import { verificarToken } from '../middlewares/verificarToken.middleware.js'; 
import { isEntrenador } from '../middlewares/verificarRoles.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Estudiantes
 *   description: Gestión de estudiantes
 */

/**
 * @swagger
 * /api/estudiantes:
 *   post:
 *     summary: Registra un nuevo estudiante.
 *     tags: [Estudiantes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - siglaTipoDocumento
 *               - nombreGenero
 *               - nombres
 *               - apellidos
 *               - numeroDocumento
 *               - fechaNacimiento
 *               - correo
 *               - programaNombres
 *             properties:
 *               siglaTipoDocumento:
 *                 type: string
 *                 description: Sigla del tipo de documento (ej. "CC", "TI").
 *                 example: "CC"
 *               nombreGenero:
 *                 type: string
 *                 description: Nombre del género (ej. "Masculino", "Femenino", "Otro").
 *                 example: "Masculino"
 *               nombres:
 *                 type: string
 *                 description: Nombres del estudiante.
 *                 example: "Juan David"
 *               apellidos:
 *                 type: string
 *                 description: Apellidos del estudiante.
 *                 example: "Pérez Gómez"
 *               numeroDocumento:
 *                 type: string
 *                 description: Número de documento único del estudiante.
 *                 example: "1020304050"
 *               fechaNacimiento:
 *                 type: string
 *                 format: date
 *                 description: Fecha de nacimiento del estudiante en formato YYYY-MM-DD.
 *                 example: "1995-08-15"
 *               correo:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico único del estudiante.
 *                 example: "juan.perez@example.com"
 *               programaNombres:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Lista de nombres de programas académicos a los que se inscribe el estudiante.
 *                 example: ["Ingeniería de Sistemas", "Diseño Gráfico"]
 *     responses:
 *       201:
 *         description: Estudiante registrado exitosamente.
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
 *                   example: Estudiante registrado exitosamente.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       description: El UUID del estudiante recién creado.
 *                     mensajeBD:
 *                       type: string
 *                       description: Mensaje devuelto por la función de la base de datos.
 *                       example: "Estudiante registrado exitosamente."
 *       400:
 *         description: Datos de entrada inválidos o faltantes, o tipo de documento/género/programa no encontrado, o máximo de programas excedido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Conflicto, el estudiante ya existe (ej. correo o número de documento duplicado).
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
  '/', 
  verificarToken,
  estudianteController.registrarNuevoEstudianteController
);

/**
 * @swagger
 * /api/estudiantes/{siglaTipoDoc}/{numeroDoc}:
 *   get:
 *     summary: Obtiene la información completa de un estudiante.
 *     tags: [Estudiantes]
 *     parameters:
 *       - in: path
 *         name: siglaTipoDoc
 *         required: true
 *         schema:
 *           type: string
 *         description: Sigla del tipo de documento del estudiante.
 *         example: "CC"
 *       - in: path
 *         name: numeroDoc
 *         required: true
 *         schema:
 *           type: string
 *         description: Número de documento del estudiante.
 *         example: "1001004970"
 *     responses:
 *       200:
 *         description: Estudiante encontrado exitosamente.
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
 *                   example: "Estudiante encontrado exitosamente."
 *                 data:
 *                   type: object
 *                   properties:
 *                     nombres:
 *                       type: string
 *                     apellidos:
 *                       type: string
 *                     tipo_documento_sigla:
 *                       type: string
 *                     numero_documento:
 *                       type: string
 *                     fecha_nacimiento:
 *                       type: string
 *                       format: date-time
 *                     correo:
 *                       type: string
 *                     programas:
 *                       type: array
 *                       items:
 *                         type: string
 *       404:
 *         description: Estudiante no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.get(
  '/:siglaTipoDoc/:numeroDoc',
  verificarToken,
  estudianteController.obtenerEstudianteController
);

/**
 * @swagger
 * /api/estudiantes/{siglaTipoDoc}/{numeroDoc}:
 *   put:
 *     summary: Modifica la información de un estudiante existente.
 *     tags: [Estudiantes]
 *     parameters:
 *       - in: path
 *         name: siglaTipoDoc
 *         required: true
 *         schema:
 *           type: string
 *         description: Sigla del tipo de documento actual del estudiante.
 *         example: "CC"
 *       - in: path
 *         name: numeroDoc
 *         required: true
 *         schema:
 *           type: string
 *         description: Número de documento actual del estudiante.
 *         example: "1020304050"
 *     requestBody:
 *       description: "Objeto con los campos a actualizar. Solo es necesario incluir los campos que se desean cambiar."
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombres:
 *                 type: string
 *                 description: Los nuevos nombres del estudiante.
 *                 example: "Carlos Alberto"
 *               apellidos:
 *                 type: string
 *                 description: Los nuevos apellidos del estudiante.
 *                 example: "Sánchez Rodríguez"
 *               correo:
 *                 type: string
 *                 format: email
 *                 description: El nuevo correo electrónico del estudiante.
 *                 example: "carlos.sanchez@example.com"
 *               fechaNacimiento:
 *                 type: string
 *                 format: date
 *                 description: La nueva fecha de nacimiento en formato YYYY-MM-DD.
 *                 example: "1998-05-20"
 *               genero:
 *                 type: string
 *                 description: El nuevo nombre del género (ej. "Masculino").
 *                 example: "Masculino"
 *               programaNombres:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Reemplazo completo de la lista de programas del estudiante.
 *                 example: ["Administración de Empresas"]
 *     responses:
 *       200:
 *         description: Información del estudiante actualizada correctamente.
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
 *                   example: "Información del estudiante CC-1020304050 procesada para actualización. Datos personales actualizados."
 *                 data:
 *                   type: object
 *                   properties:
 *                     estudianteId:
 *                       type: string
 *                       format: uuid
 *                     detalles:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Error de validación (ej. formato de correo inválido, programa no existe).
 *       404:
 *         description: Estudiante no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.put(
  '/:siglaTipoDoc/:numeroDoc',
  verificarToken,
  estudianteController.modificarEstudianteController
);

/**
 * @swagger
 * /api/estudiantes/{id}/genero:
 *   patch:
 *     summary: Actualiza el género de un estudiante específico por su ID.
 *     tags: [Estudiantes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del estudiante (UUID).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nuevoNombreGenero
 *             properties:
 *               nuevoNombreGenero:
 *                 type: string
 *                 example: "Femenino"
 *     responses:
 *       200:
 *         description: Género actualizado exitosamente.
 *       400:
 *         description: ID inválido o datos de entrada incorrectos.
 *       404:
 *         description: Estudiante o género no encontrado.
 */
router.patch(
  '/:id/genero', 
  verificarToken,
  isEntrenador,
  [ 
    validarParametroUUID('id', 'El ID del estudiante en la URL debe ser un UUID válido.'),
    body('nuevoNombreGenero').trim().notEmpty().withMessage('El nuevo nombre del género es requerido.')
  ],
  manejarResultadosValidacion,
  estudianteController.actualizarGeneroEstudiante
);

export default router; 