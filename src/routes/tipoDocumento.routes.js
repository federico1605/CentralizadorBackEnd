import { Router } from 'express';
import { obtenerTiposDocumento } from '../controllers/tipoDocumento.controller.js';
import { verificarToken } from '../middlewares/verificarToken.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: TiposDocumento
 *   description: Endpoints para la gestión de tipos de documento.
 */

/**
 * @swagger
 * /api/tipos-documento:
 *   get:
 *     summary: Obtiene la lista de todos los tipos de documento disponibles.
 *     tags: [TiposDocumento]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tipos de documento obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tipos de documento obtenidos exitosamente."
 *                 total:
 *                   type: integer
 *                   example: 4
 *                 tiposDocumento:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TipoDocumento'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/schemas/Error'
 */

// GET /api/tipos-documento - Para listar todos los tipos de documento
// Protegido: Solo usuarios autenticados pueden acceder
router.get(
  '/', // La ruta base será /api/tipos-documento (definida en index.js)
  verificarToken, // Solo requiere estar logueado, no un rol específico
  obtenerTiposDocumento
);

export default router;