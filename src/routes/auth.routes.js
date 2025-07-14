/**
 * @swagger
 * components:
 *   schemas:
 *     LoginResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Inicio de sesión exitoso."
 *         token:
 *           type: string
 *           description: Token JWT para autenticación.
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             numeroDocumento:
 *               type: string
 *             correo:
 *               type: string
 *               format: email
 *             rol:
 *               type: string
 *               enum: [admin, entrenador]
 *               description: Rol del usuario autenticado.
 */

import { Router } from "express";
import { loginAdmin, loginEntrenador } from "../controllers/auth.controller.js";

// Enrutador de Express
const router = Router();

/**
 * @swagger
 * tags:
 *   name: Autenticación
 *   description: Endpoints para el inicio de sesión de usuarios. Estos endpoints NO requieren autenticación previa.
 */

/**
 * @swagger
 * /api/login/admin:
 *   post:
 *     summary: Inicia sesión como administrador.
 *     tags:
 *       - Autenticación
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - numeroDocumento
 *             properties:
 *               numeroDocumento:
 *                 type: string
 *                 description: Número de documento del administrador.
 *                 example: "1234567890"
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso. Retorna un token JWT.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         description: Credenciales inválidas o no autorizado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.post("/login/admin", loginAdmin);

/**
 * @swagger
 * /api/login/entrenador:
 *   post:
 *     summary: Inicia sesión como entrenador.
 *     tags:
 *       - Autenticación
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - correo
 *             properties:
 *               correo:
 *                 type: string
 *                 description: Correo electrónico del entrenador.
 *                 example: "entrenador@example.com"
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso. Retorna un token JWT.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         description: Credenciales inválidas o no autorizado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.post("/login/entrenador", loginEntrenador);

// Exportamos el enrutador para usarlo en el servidor principal
export default router;
