import { Router } from 'express';
import { obtenerFacultades } from '../controllers/facultad.controller.js';
import { verificarToken } from '../middlewares/verificarToken.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Facultades
 *   description: Endpoints para la gestión de facultades.
 */

/**
 * @swagger
 * /api/facultades:
 *   get:
 *     summary: Obtiene la lista de todas las facultades disponibles.
 *     tags: [Facultades]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de facultades obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Facultades obtenidas exitosamente.
 *                 total:
 *                   type: integer
 *                   example: 5
 *                 facultades:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Facultad'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
// GET /facultades - Para listar todas las facultades
// Protegido: Solo usuarios autenticados pueden acceder
router.get(
  '/', // La ruta base será /facultades
  verificarToken,
  obtenerFacultades
);

export default router;