/**
 * @swagger
 * components:
 *   schemas:
 *     VariableCognitiva:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         activa:
 *           type: boolean
 *         nombre:
 *           type: string
 *           example: "Lectura Crítica"
 *         descripcion:
 *           type: string
 */

import pool from '../config/db.js';

export const abandonarVariableCognitiva = async (siglaDocumento, numeroDocumento, idVariableCognitiva) => {
    const query = 'SELECT * FROM cc.abandonarvariablecognitivauft($1, $2, $3)';
    const values = [siglaDocumento, numeroDocumento, idVariableCognitiva];
    try {
        const { rows } = await pool.query(query, values);
        return rows[0];
    } catch (error) {
        console.error('Error en abandonarVariableCognitiva model', error);
        throw error;
    }
};

export const reactivarVariableCognitiva = async (siglaDocumento, numeroDocumento, idVariableCognitiva) => {
    const query = 'SELECT * FROM cc.reactivarvariablecognitivauft($1, $2, $3)';
    const values = [siglaDocumento, numeroDocumento, idVariableCognitiva];
    try {
        const { rows } = await pool.query(query, values);
        return rows[0];
    } catch (error) {
        console.error('Error en reactivarVariableCognitiva model', error);
        throw error;
    }
};

export const obtenerIdVariableCognitivaPorNombre = async (nombre) => {
    const query = 'SELECT id FROM CC.variablecognitiva WHERE nombre = $1';
    const values = [nombre];
    try {
        const { rows } = await pool.query(query, values);
        return rows[0];
    } catch (error) {
        console.error('Error en obtenerIdVariableCognitivaPorNombre model', error);
        throw error;
    }
}; 