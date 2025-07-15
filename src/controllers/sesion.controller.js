import * as entrenamientoCognitivoService from '../services/entrenamientoCognitivo.service.js';
import { handleControllerError } from '../utils/response.util.js';
import logger from '../config/logger.js';


/**
 * Crea una nueva sesión cognitiva.
 * 
 * @async
 * @function
 * @param {import('express').Request} req - Objeto de solicitud HTTP, contiene los datos de la sesión en el cuerpo.
 * @param {import('express').Response} res - Objeto de respuesta HTTP.
 * @param {import('express').NextFunction} next - Función para pasar el control al siguiente middleware.
 * @returns {Promise<void>}
 * 
 * @description
 * Recibe los datos de la sesión desde el cuerpo de la petición, llama al servicio para crear una nueva sesión
 * y responde con el resultado. En caso de error, delega el manejo al middleware de errores.
 */
export const crearSesion = async (req, res, next) => {
  logger.info('[CTRL_SESION] Petición para crear sesión', req.body);
  try {
    const datosSesion = req.body;
    const resultado = await entrenamientoCognitivoService.crearNuevaSesion(datosSesion);

    res.status(201).json({
      success: true,
      message: resultado.mensaje,
      data: resultado.data // resultado.data contiene el objeto { sesionentrenamientoid: '...' }
    });

  } catch (error) {
    // El manejador de errores se encarga del resto.
    handleControllerError(error, next, 'en crearSesion');
  }
};


/**
 * Controlador para iniciar una sesión de entrenamiento cognitivo.
 * 
 * @async
 * @function iniciarSesion
 * @param {import('express').Request} req - Objeto de solicitud de Express, espera el parámetro idSesion en req.params.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - Función next de Express para manejo de errores.
 * @returns {Promise<void>} Retorna una respuesta HTTP con el resultado de la operación o pasa el error al middleware de manejo de errores.
 */
export const iniciarSesion = async (req, res, next) => {
    const { idSesion } = req.params;
    logger.info(`[CTRL_SESION] Petición para iniciar sesión ID: ${idSesion}`);
    try {
        const resultado = await entrenamientoCognitivoService.iniciarSesion(idSesion);

        res.status(200).json({
            success: true,
            message: resultado.mensaje,
            data: resultado.data
        });

    } catch (error) {
        handleControllerError(error, next, 'en iniciarSesion');
    }
};