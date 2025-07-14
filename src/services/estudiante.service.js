import * as EstudianteModel from '../models/estudiante.model.js';
import logger from '../config/logger.js';
import { throwClientError } from '../utils/response.util.js';

/**
 * @file Contiene los servicios relacionados con la entidad Estudiante.
 */

/**
 * @typedef {import('../models/estudiante.model.js').RegistrarEstudianteDataDB} RegistrarEstudianteDataDB
 */

/**
 * Valida si una cadena es una fecha válida en formato YYYY-MM-DD.
 * @param {string} dateString
 * @returns {boolean}
 */
function isValidDateString(dateString) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return false;
  return date.toISOString().slice(0, 10) === dateString;
}

/**
 * Servicio para registrar un nuevo estudiante.
 * Delega la validación de IDs de entidades relacionadas (tipo de documento, género, programas)
 * y la inserción a la función de base de datos CC.RegistrarEstudiante.
 * @async
 * @param {object} datosEntrada - Datos del estudiante provenientes del controlador.
 * @param {string} datosEntrada.siglaTipoDocumento - Sigla del tipo de documento (ej. "CC").
 * @param {string} datosEntrada.nombreGenero - Nombre del género (ej. "Masculino").
 * @param {string} datosEntrada.nombres - Nombres del estudiante.
 * @param {string} datosEntrada.apellidos - Apellidos del estudiante.
 * @param {string} datosEntrada.numeroDocumento - Número de documento.
 * @param {string} datosEntrada.fechaNacimiento - Fecha de nacimiento (YYYY-MM-DD).
 * @param {string} datosEntrada.correo - Correo electrónico.
 * @param {string[]} datosEntrada.programaNombres - Array de nombres de programas.
 * @returns {Promise<{success: boolean, data?: object, message?: string, statusCode?: number}>}
 *          Objeto indicando éxito y los datos del estudiante creado, o un mensaje de error.
 */
export const registrarEstudiante = async (datosEntrada) => {
  const {
    siglaTipoDocumento,
    nombreGenero,
    nombres,
    apellidos,
    numeroDocumento,
    fechaNacimiento,
    correo,
    programaNombres,
  } = datosEntrada;

  logger.debug('[SERVICIO_ESTUDIANTE] Solicitud para registrar nuevo estudiante:', datosEntrada);

  // --- Validaciones (solo para los campos básicos que el servicio sigue recibiendo) ---
  if (!siglaTipoDocumento || typeof siglaTipoDocumento !== 'string' || !siglaTipoDocumento.trim()) {
    throwClientError('La sigla del tipo de documento es requerida.', 400);
  }
  if (!nombreGenero || typeof nombreGenero !== 'string' || !nombreGenero.trim()) {
    throwClientError('El nombre del género es requerido.', 400);
  }
  if (!nombres || typeof nombres !== 'string' || !nombres.trim()) {
    throwClientError('El nombre del estudiante es requerido.', 400);
  }
  if (!apellidos || typeof apellidos !== 'string' || !apellidos.trim()) {
    throwClientError('Los apellidos del estudiante son requeridos.', 400);
  }
  if (!numeroDocumento || typeof numeroDocumento !== 'string' || !numeroDocumento.trim()) {
    throwClientError('El número de documento es requerido.', 400);
  }
  if (!fechaNacimiento || !isValidDateString(fechaNacimiento)) {
    throwClientError('La fecha de nacimiento es requerida y debe estar en formato YYYY-MM-DD.', 400);
  }
  if (!correo || typeof correo !== 'string' || !/.+@.+\..+/.test(correo.trim())) {
    throwClientError('El correo electrónico es requerido y debe tener un formato válido.', 400);
  }
  if (!Array.isArray(programaNombres) || programaNombres.length === 0) {
    throwClientError('Se debe especificar al menos un programa académico.', 400);
  }
  if (programaNombres.some(p => typeof p !== 'string' || !p.trim())) {
    throwClientError('Los nombres de los programas deben ser cadenas de texto no vacías.', 400);
  }

  try {
    const datosEstudianteParaDB = {
      pSiglaTipoDocumento: siglaTipoDocumento.trim(),
      pGeneroNombre: nombreGenero.trim(),
      pNombres: nombres.trim(),
      pApellidos: apellidos.trim(),
      pNumeroDocumento: numeroDocumento.trim(),
      pFechaNacimiento: fechaNacimiento,
      pCorreo: correo.trim(),
      pProgramaNombres: programaNombres.map(p => p.trim()),
    };

    const { estudianteId, mensaje } = await EstudianteModel.registrarEstudianteDB(datosEstudianteParaDB);
    
    // CASO 1: Éxito explícito
    if (mensaje && mensaje.toLowerCase().includes('exitosamente')) {
      logger.info(`[SERVICIO_ESTUDIANTE] Estudiante registrado exitosamente con ID: ${estudianteId || 'No devuelto'}`);
      return {
        success: true,
        data: { id: estudianteId, message: mensaje },
        message: mensaje,
      };
    }

    // CASO 2: Error de negocio reportado por la BD (ej. unicidad)
    const lowerCaseMessage = (mensaje || '').toLowerCase();
    logger.warn(`[SERVICIO_ESTUDIANTE] Operación en BD reportó un error controlado: ${mensaje}`);

    if (lowerCaseMessage.includes('unicidad') || lowerCaseMessage.includes('violates unique constraint')) {
      let userMessage = 'El valor de un campo único ya está registrado.';
      if (lowerCaseMessage.includes('correo')) {
        userMessage = 'El correo electrónico ingresado ya está registrado.';
      } else if (lowerCaseMessage.includes('numerodocumento')) {
        userMessage = 'El número de documento ingresado ya está registrado.';
      }
      throwClientError(userMessage, 409); // 409 Conflict
    }

    // CASO 3: Otro error controlado por la BD o respuesta inesperada
    throwClientError(mensaje || 'La operación en la base de datos no se completó correctamente.', 400);

  } catch (error) {
    // Esto captura tanto los errores lanzados por `throwClientError` como errores inesperados (ej. conexión)
    logger.error(`[SERVICIO_ESTUDIANTE] Error en el flujo de registro de estudiante: ${error.message}`);

    if (error.statusCode) {
      throw error; // Si ya tiene código, lo relanzamos para el middleware global.
    }

    // Si es un error inesperado sin código, lo marcamos como 500.
    const serverError = new Error('Ocurrió un error inesperado en el servidor.');
    serverError.statusCode = 500;
    throw serverError;
  }
};

/**
 * Servicio para modificar la información de un estudiante existente.
 * Llama a la función de la base de datos que maneja la lógica de actualización.
 * @async
 * @param {string} siglaTipoDocActual - La sigla del tipo de documento actual del estudiante.
 * @param {string} numeroDocActual - El número de documento actual del estudiante.
 * @param {object} datosParaActualizar - Objeto con los nuevos datos del estudiante.
 * @returns {Promise<object>} El resultado de la operación desde la base de datos.
 */
export const modificarEstudiante = async (siglaTipoDocActual, numeroDocActual, datosParaActualizar) => {
  logger.debug(`[SERVICIO_ESTUDIANTE] Solicitud para modificar estudiante ${siglaTipoDocActual}-${numeroDocActual}`);
  
  const {
    nombres,
    apellidos,
    correo,
    fechaNacimiento,
    genero,
    programaNombres
  } = datosParaActualizar;

  try {
    // La función de la BD espera todos los parámetros. Si no vienen en el body, les pasamos null.
    const resultado = await EstudianteModel.modificarInformacionEstudiante({
      pSiglaTipoDocActual: siglaTipoDocActual,
      pNumeroDocActual: numeroDocActual,
      pNuevosNombres: nombres ?? null,
      pNuevosApellidos: apellidos ?? null,
      pNuevoCorreo: correo ?? null,
      pNuevaFechaNacimiento: fechaNacimiento ?? null,
      pNuevoNombreGenero: genero ?? null,
      pNuevosNombresProgramas: programaNombres ?? null,
    });

    if (!resultado || resultado.length === 0) {
      throwClientError('La operación de modificación no devolvió ningún resultado.', 500);
    }
    
    const resultadoDB = resultado[0];

    // Analizar el mensaje devuelto por la BD para detectar errores de negocio.
    if (resultadoDB.mensaje) {
      const lowerCaseMessage = resultadoDB.mensaje.toLowerCase();

      // Caso específico: correo duplicado, debe ser un error 409 Conflict.
      if (lowerCaseMessage.includes('ya está en uso por otro estudiante')) {
        throwClientError(resultadoDB.mensaje, 409);
      }
      
      // Caso genérico: cualquier otro mensaje que no sea de éxito es un error 400.
      // Un mensaje de éxito contiene "procesada para actualización".
      if (!lowerCaseMessage.includes('procesada para actualización')) {
        throwClientError(resultadoDB.mensaje, 400);
      }
    }

    logger.info(`[SERVICIO_ESTUDIANTE] Modificación procesada para ${siglaTipoDocActual}-${numeroDocActual}. Mensaje DB: ${resultadoDB.mensaje}`);
    return resultadoDB;

  } catch (error) {
    logger.error(`[SERVICIO_ESTUDIANTE] Error en el servicio al modificar estudiante: ${error.message}`);
    
    // Este bloque ahora capturará los errores lanzados por throwClientError
    // y errores de conexión/inesperados.
    if (error.statusCode) {
      throw error; // Relanzamos errores ya formateados
    }

    // Para errores realmente inesperados.
    const serverError = new Error('Ocurrió un error inesperado en el servidor al intentar modificar el estudiante.');
    serverError.statusCode = 500;
    throw serverError;
  }
};

/**
 * Servicio para obtener la información completa de un estudiante por su documento.
 * @async
 * @param {string} siglaTipoDoc - La sigla del tipo de documento del estudiante.
 * @param {string} numeroDoc - El número de documento del estudiante.
 * @returns {Promise<object>} El objeto con la información completa del estudiante.
 * @throws {Error} Si el estudiante no es encontrado (404) o si ocurre otro error.
 */
export const obtenerEstudiantePorDocumento = async (siglaTipoDoc, numeroDoc) => {
  logger.debug(`[SERVICIO_ESTUDIANTE] Solicitud para obtener estudiante ${siglaTipoDoc}-${numeroDoc}`);
  
  try {
    const resultado = await EstudianteModel.obtenerInformacionCompleta(siglaTipoDoc, numeroDoc);

    if (!resultado || resultado.length === 0) {
      throwClientError('Estudiante no encontrado.', 404);
    }
    
    logger.info(`[SERVICIO_ESTUDIANTE] Estudiante ${siglaTipoDoc}-${numeroDoc} encontrado.`);
    return resultado[0];

  } catch (error) {
    logger.error(`[SERVICIO_ESTUDIANTE] Error en el servicio al obtener estudiante: ${error.message}`);
    if (error.statusCode) {
      throw error; // Relanzamos errores ya formateados (de throwClientError o 404)
    }
    const serverError = new Error('Ocurrió un error inesperado en el servidor al buscar el estudiante.');
    serverError.statusCode = 500;
    throw serverError;
  }
}; 

/**
 * Servicio para actualizar el género de un estudiante por su ID.
 * @async
 * @param {string} estudianteId - El UUID del estudiante.
 * @param {string} nuevoNombreGenero - El nuevo nombre del género.
 * @returns {Promise<object>} El resultado de la operación desde la base de datos.
 * @throws {Error} Si el estudiante o el género no se encuentran.
 */
export const actualizarGenero = async (estudianteId, nuevoNombreGenero) => {
  try {
    const resultadoDB = await EstudianteModel.actualizarGenero(
      estudianteId,
      nuevoNombreGenero
    );

    if (!resultadoDB || !resultadoDB.estudianteid) {
      throwClientError(resultadoDB.mensaje || 'Estudiante o género no encontrado.', 404);
    }
    
    // Si la BD devuelve un mensaje de no actualización, también lo manejamos.
    if (resultadoDB.mensaje.includes('No se requiere actualización')) {
        return resultadoDB;
    }
    
    // Si hubo un error controlado por la BD que no sea "no encontrado".
    if (!resultadoDB.generoactualizadoid){
       throwClientError(resultadoDB.mensaje || 'Ocurrió un error en la base de datos.', 400);
    }

    return resultadoDB;

  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`Error en el servicio al actualizar género: ${error.message}`);
  }
};