const port = process.env.PORT || 3001;

/**
 * @file Contiene la configuración central para swagger-jsdoc.
 */

export const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Documentación de la API de CentralizadorBackEnd',
      version: '1.0.0',
      contact: {
        name: 'Equipo de Desarrollo',
        email: 'devteam@example.com',
      },
      description: 'API REST para la gestión de datos de la plataforma CogniCare, incluyendo estudiantes, entrenadores y entrenamientos cognitivos.\n\nAutenticación\n\n **IMPORTANTE:** La mayoría de los endpoints requieren un token de autenticación (JWT Bearer).\n\nPara acceder a los endpoints protegidos, sigue estos pasos:\n1. **Obtén tu token:** Realiza una petición `POST` a `/api/login/admin` o `/api/login/entrenador` con tus credenciales.\n2. **Autoriza tus peticiones:** Haz clic en el botón **"Authorize"** (arriba a la derecha) y pega tu token en el campo `bearerAuth` con el formato `Bearer <TU_TOKEN_JWT>`.\n\nRoles y Permisos\n\nLa API cuenta con dos roles principales con diferentes niveles de acceso:\n\n### **Admin**\n- Gestión completa de entrenadores (CRUD).\n- Visualización de todos los informes de entrenamiento.\n- Acceso total a las utilidades del sistema.\n\n### **Entrenador**\n- Gestión de estudiantes y sus entrenamientos cognitivos.\n- Creación y seguimiento de sesiones de entrenamiento.\n- Visualización de informes de los estudiantes asignados.',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: 'Servidor de Desarrollo Local',
      },
    ],
    // Aplica seguridad 'bearerAuth' a todos los endpoints por defecto.
    security: [
      {
        bearerAuth: []
      }
    ],
    // Define los esquemas de seguridad y los schemas globales.
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenido al hacer login. Formato: `Bearer <tu_token>`',
        },
      },
      // NOTA: La mayoría de schemas se definen ahora en los archivos de /models.
      // Solo dejamos aquí schemas muy genéricos como el de Error.
      schemas: {
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Mensaje de error.',
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  msg: { type: 'string', description: 'Mensaje de validación del error.' },
                  param: { type: 'string', description: 'Parámetro asociado al error.' },
                  location: { type: 'string', description: 'Ubicación del error (e.g., "body").' },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js', './src/models/*.js'],
};