import express from 'express';
import { abandonarVariableCognitiva, reactivarVariableCognitiva, obtenerIdVariableCognitivaPorNombre } from '../controllers/variablesCognitivas.controller.js';
import { verificarToken } from '../middlewares/verificarToken.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/variables-cognitivas/abandonar:
 *   patch:
 *     summary: Marcar una asignación de variable cognitiva como 'Abandono' para un estudiante específico.
 *     tags: [VariablesCognitivas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - siglaDocumento
 *               - numeroDocumento
 *               - idVariableCognitiva
 *             properties:
 *               siglaDocumento:
 *                 type: string
 *                 description: Sigla del tipo de documento del estudiante (ej. "CC").
 *               numeroDocumento:
 *                 type: string
 *                 description: Número de documento del estudiante.
 *               idVariableCognitiva:
 *                 type: string
 *                 format: uuid
 *                 description: El UUID de la variable cognitiva a abandonar.
 *     responses:
 *       200:
 *         description: Operación exitosa.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
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
 *       400:
 *         description: Petición incorrecta, datos faltantes o error de lógica de negocio (ej. estudiante no encontrado).
 *       500:
 *         description: Error del servidor.
 */
router.patch('/abandonar', verificarToken, abandonarVariableCognitiva);

/**
 * @swagger
 * /api/variables-cognitivas/reactivar:
 *   patch:
 *     summary: Reactivar una asignación de variable cognitiva que estaba en estado 'Abandono'.
 *     tags: [VariablesCognitivas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - siglaDocumento
 *               - numeroDocumento
 *               - idVariableCognitiva
 *             properties:
 *               siglaDocumento:
 *                 type: string
 *                 description: Sigla del tipo de documento del estudiante (ej. "CC").
 *               numeroDocumento:
 *                 type: string
 *                 description: Número de documento del estudiante.
 *               idVariableCognitiva:
 *                 type: string
 *                 format: uuid
 *                 description: El UUID de la variable cognitiva a reactivar.
 *     responses:
 *       200:
 *         description: Operación exitosa.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
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
 *       400:
 *         description: Petición incorrecta, datos faltantes o la variable no estaba en estado 'Abandono'.
 *       500:
 *         description: Error del servidor.
 */
router.patch('/reactivar', verificarToken, reactivarVariableCognitiva);

/**
 * @swagger
 * /api/variables-cognitivas/nombre/{nombre}:
 *   get:
 *     summary: Obtener el ID de una variable cognitiva por su nombre.
 *     tags: [VariablesCognitivas]
 *     parameters:
 *       - in: path
 *         name: nombre
 *         schema:
 *           type: string
 *         required: true
 *         description: El nombre exacto de la variable cognitiva a buscar (ej. 'Control Inhibitorio').
 *     responses:
 *       200:
 *         description: ID de la variable encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *       404:
 *         description: Variable cognitiva no encontrada.
 *       500:
 *         description: Error del servidor.
 */
router.get('/nombre/:nombre', verificarToken, obtenerIdVariableCognitivaPorNombre);

export default router; 