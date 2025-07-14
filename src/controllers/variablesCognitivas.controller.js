import { abandonarVariableCognitiva as abandonarVariableCognitivaService, reactivarVariableCognitiva as reactivarVariableCognitivaService, obtenerIdVariableCognitivaPorNombre as obtenerIdVariableCognitivaPorNombreService } from '../services/variablesCognitivas.service.js';
import { sendSuccess, sendError } from '../utils/response.util.js';

export const abandonarVariableCognitiva = async (req, res) => {
    try {
        const { siglaDocumento, numeroDocumento, idVariableCognitiva } = req.body;

        if (!siglaDocumento || !numeroDocumento || !idVariableCognitiva) {
            return sendError(res, 400, 'Datos incompletos. Se requiere siglaDocumento, numeroDocumento y idVariableCognitiva.');
        }

        const resultado = await abandonarVariableCognitivaService({ siglaDocumento, numeroDocumento, idVariableCognitiva });

        if (resultado && resultado.exito) {
            sendSuccess(res, 200, resultado.mensaje, {
                asignacionId: resultado.asignacionid,
                detalles: resultado.detalles
            });
        } else {
            sendError(res, 400, resultado ? resultado.mensaje : 'No se pudo completar la operación', resultado ? { detalles: resultado.detalles } : null);
        }
    } catch (error) {
        sendError(res, error.statusCode || 500, error.message || 'Error interno del servidor al abandonar la variable cognitiva');
    }
};

export const reactivarVariableCognitiva = async (req, res) => {
    try {
        const { siglaDocumento, numeroDocumento, idVariableCognitiva } = req.body;

        if (!siglaDocumento || !numeroDocumento || !idVariableCognitiva) {
            return sendError(res, 400, 'Datos incompletos. Se requiere siglaDocumento, numeroDocumento y idVariableCognitiva.');
        }

        const resultado = await reactivarVariableCognitivaService({ siglaDocumento, numeroDocumento, idVariableCognitiva });

        if (resultado && resultado.exito) {
            sendSuccess(res, 200, resultado.mensaje, {
                asignacionId: resultado.asignacionid,
                detalles: resultado.detalles
            });
        } else {
            sendError(res, 400, resultado ? resultado.mensaje : 'No se pudo completar la reactivación', resultado ? { detalles: resultado.detalles } : null);
        }
    } catch (error) {
        sendError(res, error.statusCode || 500, error.message || 'Error interno del servidor al reactivar la variable cognitiva');
    }
};

export const obtenerIdVariableCognitivaPorNombre = async (req, res) => {
    try {
        const { nombre } = req.params;
        const resultado = await obtenerIdVariableCognitivaPorNombreService(nombre);

        if (resultado && resultado.id) {
            sendSuccess(res, 200, 'ID de la variable cognitiva obtenido con éxito.', { id: resultado.id });
        } else {
            sendError(res, 404, `No se encontró una variable cognitiva con el nombre '${nombre}'.`);
        }
    } catch (error) {
        sendError(res, error.statusCode || 500, error.message || 'Error interno del servidor al obtener el ID de la variable cognitiva.');
    }
};
