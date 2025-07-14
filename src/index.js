import express from "express";
import cors from "cors";
import morgan from "morgan";
import logger from "./config/logger.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import tipoDocumentoRoutes from "./routes/tipoDocumento.routes.js";
import facultadRoutes from "./routes/facultad.routes.js";
import entrenamientoCognitivoRoutes from "./routes/entrenamientoCognitivo.routes.js";
import estudianteRoutes from "./routes/estudiante.routes.js";
import utilidadesRoutes from "./routes/utilidades.routes.js";
import entrenadorRoutes from "./routes/entrenador.routes.js";
import variablesCognitivasRoutes from "./routes/variablesCognitivas.routes.js";
import sesionRoutes from "./routes/sesion.routes.js";
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { swaggerOptions } from "./swagger.config.js";

const app = express();
const port = 3001;

// Generar la especificación Swagger
// swagger-jsdoc lee las anotaciones JSDoc en los archivos de rutas y modelos
const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Configuración CORS
app.use(cors());

// Middleware para servir la documentación de Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'list',
    filter: true,
  },
  customSiteTitle: 'CentralizadorBackEnd API - Documentación',
}));

// Middleware para parsear JSON
app.use(express.json());

// Configuración de Morgan para que use Winston como logger
// El formato 'combined' es un formato estándar de Apache
app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.http(message.trim()), // Envía los logs HTTP a Winston con nivel 'http'
    },
  })
);

// Ruta de prueba
app.get("/test", (req, res) => {
  logger.info("--- [LOG] ¡¡¡Petición recibida en /test !!! ---");
  res.status(200).send("¡El backend (reestructurado) está respondiendo!");
});

// Rutas
app.use("/api", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/tipos-documento", tipoDocumentoRoutes);
app.use("/api/facultades", facultadRoutes);
app.use("/api/entrenamientos-cognitivos", entrenamientoCognitivoRoutes);
app.use("/api/estudiantes", estudianteRoutes);
app.use("/api/utilidades", utilidadesRoutes);
app.use("/api/entrenadores", entrenadorRoutes);
app.use("/api/variables-cognitivas", variablesCognitivasRoutes);
app.use('/api/sesiones', sesionRoutes);

// Middleware para manejar 404
app.use((req, res) => {
  logger.warn(`--- [404] Ruta no encontrada: ${req.method} ${req.path}`);
  res
    .status(404)
    .json({ message: `Ruta no encontrada: ${req.method} ${req.path}` });
});

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const esErrorDeCliente = statusCode >= 400 && statusCode < 500;

  if (esErrorDeCliente) {
    logger.warn(`--- [ERROR_HANDLER] Error de cliente (${statusCode}) --- ${err.message}`, {
      path: req.path,
      method: req.method,
      // Si err.errors existe (de express-validator), también se podría loguear aquí
      ...(err.errors && { validationErrors: err.errors })
    });
  } else {
    // Para errores de servidor, logueamos el objeto err completo para obtener el stack trace
    logger.error('--- [ERROR_HANDLER] Error de servidor no controlado ---', err);
  }
  
  res.status(statusCode).json({
    message: err.message || (esErrorDeCliente ? 'Error en la petición.' : 'Error interno del servidor.'),
    // Solo enviar stack en desarrollo Y si NO es un error de cliente
    stack: (process.env.NODE_ENV === 'development' && !esErrorDeCliente) ? err.stack : undefined,
    // Enviar detalles de validación si existen y es error de cliente
    ...(esErrorDeCliente && err.errors && { errors: err.errors }) 
  });
});

// Iniciar el servidor
app.listen(port, () => {
  logger.info(`Backend escuchando en http://localhost:${port}`); //
});
