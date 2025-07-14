import { Router } from 'express';
import * as utilidadesController from '../controllers/utilidades.controller.js';
import logger from '../config/logger.js';
import { verificarToken } from '../middlewares/verificarToken.middleware.js'; 

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Utilidades
 *   description: Endpoints de utilidad general (listas desplegables, etc.)
 */

/**
 * @swagger
 * /api/utilidades/generos:
 *   get:
 *     summary: Obtiene la lista de todos los géneros disponibles.
 *     tags: [Utilidades]
 *     responses:
 *       200:
 *         description: Lista de géneros obtenida exitosamente.
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
 *                   example: Lista de géneros obtenida exitosamente.
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Genero' 
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/generos', verificarToken, utilidadesController.obtenerGenerosController);

/**
 * @swagger
 * /api/utilidades/tipos-documento:
 *   get:
 *     summary: Obtiene la lista de todos los tipos de documento disponibles.
 *     tags: [Utilidades]
 *     responses:
 *       200:
 *         description: Lista de tipos de documento obtenida exitosamente.
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
 *                   example: Lista de tipos de documento obtenida exitosamente.
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TipoDocumento' 
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/tipos-documento', verificarToken, utilidadesController.obtenerTiposDocumentoController);

/**
 * @swagger
 * /api/utilidades/programas:
 *   get:
 *     summary: Obtiene la lista de todos los programas disponibles.
 *     tags: [Utilidades]
 *     responses:
 *       200:
 *         description: Lista de programas obtenida exitosamente.
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
 *                   example: Lista de programas obtenida exitosamente.
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Programa' 
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/programas', verificarToken, utilidadesController.obtenerProgramasController);

/**
 * @swagger
 * /api/utilidades/tipos-variables-cognitivas:
 *   get:
 *     summary: Obtiene la lista de todos los tipos de variables cognitivas disponibles.
 *     tags: [Utilidades]
 *     responses:
 *       200:
 *         description: Lista de tipos de variables cognitivas obtenida exitosamente.
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
 *                   example: Lista de tipos de variables cognitivas obtenida exitosamente.
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TipoVariableCognitiva'
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/tipos-variables-cognitivas', verificarToken, utilidadesController.obtenerTiposVariablesCognitivasController);

/**
 * @swagger
 * /api/utilidades/estudiantes/documento/{tipoDocumento}/{numeroDocumento}:
 *   get:
 *     summary: Obtiene el ID de un estudiante por su tipo y número de documento.
 *     tags: [Utilidades]
 *     parameters:
 *       - in: path
 *         name: tipoDocumento
 *         required: true
 *         description: Sigla del tipo de documento del estudiante (ej. "CC", "TI").
 *         schema:
 *           type: string
 *           example: "CC"
 *       - in: path
 *         name: numeroDocumento
 *         required: true
 *         description: Número de documento del estudiante.
 *         schema:
 *           type: string
 *           example: "1036402111"
 *     responses:
 *       200:
 *         description: ID de estudiante obtenido exitosamente.
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
 *                   example: "ID de estudiante obtenido exitosamente."
 *                 data:
 *                   type: string
 *                   format: uuid
 *                   description: El UUID del estudiante encontrado.
 *                   example: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
 *       400:
 *         description: Datos de entrada inválidos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: No se encontró estudiante con el tipo y número de documento especificados.
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
 *                   example: "No se encontró estudiante con el tipo y número de documento especificados."
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/estudiantes/documento/:tipoDocumento/:numeroDocumento', verificarToken, utilidadesController.obtenerIdEstudiantePorDocumentoController);

export default router; 