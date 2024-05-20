const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

// Load environment variables from .env file
dotenv.config();

// Create an instance of Express
const app = express();

// Set the port to the value in the environment variable PORT, or 3006 if it's not set
const PORT = process.env.PORT || 3006;

// Connect to MongoDB using the connection string from the environment variables
mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        // If the connection is successful, log it to the console
        console.log('👓 Connected to DB');
        logger.info('👓 Connected to DB');
    })
    .catch((error) => {
        // If there is a connection error, log it to the console
        console.log('Connection Error => : ', error.message);
        logger.info('Connection Error => : ', error.message);
    });

// Import routes
const authRoute = require('./routes/auth');
const userRoute = require('./routes/users');
const questionRoute = require('./routes/questions');
const pollRoute = require('./routes/polls');
const statisticRoute = require('./routes/statistics');
const logger = require('./util/logger');

// Increase the body parser limit to enable parsing larger request bodies
app.use(bodyParser.json({ limit: '50mb', extended: true }));

// Set up CORS with a specific origin and allow credentials (such as cookies, authorization headers, etc.)
app.use(
    cors({
        credentials: true,
        origin: [
            'http://localhost:9000',
        ],
    }),
);

// Enable Express to parse JSON bodies in requests
app.use(express.json());

// Use cookieParser middleware for parsing cookies attached to the client request object
app.use(cookieParser());

// Define a simple route for GET request on the root path
app.get('/', (req, res) => {
    res.send('Poll API Server is running!');
});

app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);
app.use('/api/questions', questionRoute);
app.use('/api/polls', pollRoute);
app.use('/api/statistics', statisticRoute);

// Configure Swagger options for generating API documentation
const swaggerOptions = {
    failOnErrors: true,
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Poll API',
            version: '1.0.0',
            description: 'API Documentation for Poll Service'
        },
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT'
            }
          }
        },
    },
    // Path to the API docs
    apis: ['./routes/*.js']
};

// Initialize Swagger middleware to serve the API documentation
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

// Start the server and listen on the configured port
app.listen(PORT, () => console.log(`🛺  API Server UP and Running at ${process.env.SERVER_URL}`));
