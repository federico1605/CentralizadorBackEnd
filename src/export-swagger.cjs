
const fs = require('fs');
const swaggerJsdoc = require('swagger-jsdoc');

const { swaggerOptions } = require('./swagger.config.js');

console.log('Generando especificación de Swagger...');


const swaggerSpec = swaggerJsdoc(swaggerOptions);

fs.writeFileSync('./swagger.json', JSON.stringify(swaggerSpec, null, 2));

console.log('✅ Documento Swagger exportado exitosamente como swagger.json');