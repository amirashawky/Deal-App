import swaggerJSDoc from 'swagger-jsdoc';

let swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Deal App',
        version: '1.0.0',
    },
    servers: [
        {
          url: 'http://localhost:3000/api/v1',
        },
      ],

    host: 'localhost:3000',
    basePath: '/api/v1',
    securityDefinitions: {
        JWT: {
            type: 'apiKey',
            description: 'Ex: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....',
            name: 'Authorization',
            in: 'header'
        }
    },
    security: [
        {
            'JWT': []
        }
    ]
    
};


let options = {
    swaggerDefinition: swaggerDefinition,
    apis: ['./src/routes/**/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec ;
