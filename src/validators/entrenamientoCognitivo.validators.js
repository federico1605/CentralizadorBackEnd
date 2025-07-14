import { body } from "express-validator";

/**
 * Define las validaciones para la actualización de la observación de una sesión.
 */
export const validacionesActualizarObservacion = [
  body('nuevaObservacion')
    .trim() 
    .notEmpty().withMessage('La observación no puede estar vacía.')
    .isString().withMessage('La observación debe ser una cadena de texto.')
    .isLength({ max: 500 }).withMessage('La observación no puede exceder los 500 caracteres.')
];

/**
 * Define las validaciones para finalizar una sesión de entrenamiento.
 */
export const validacionesFinalizarSesion = [
  body('nuevasMetricas')
    .notEmpty().withMessage('Las nuevas métricas son requeridas.')
    .isObject().withMessage('Las nuevas métricas deben ser un objeto JSON válido.')
    .custom((value) => {
      if (Array.isArray(value)) {
        throw new Error('Las nuevas métricas no pueden ser un array.');
      }
      return true;
    }),
  body('nuevoNivelInicial')
    .notEmpty().withMessage('El nuevo nivel inicial es requerido.')
    .isObject().withMessage('El nuevo nivel inicial debe ser un objeto JSON válido.')
    .custom((value) => {
      if (Array.isArray(value)) {
        throw new Error('El nuevo nivel inicial no puede ser un array.');
      }
      return true;
    })
];