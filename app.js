require('dotenv').config();
require('express-async-errors');

//* Security packages
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');

//* Express.js
const express = require('express');
const app = express();
const connectDB = require('./db/connect');
const authRouter = require('./routes/auth.route');
const jobsRouter = require('./routes/jobs.route');

//* Swagger UI
const swagger = require('swagger-ui-express');
const yaml = require('yamljs');
const swaggerDoc = yaml.load('./views/swagger.yaml');

//* Middlewares
const authenticateUser = require('./middleware/authentication');

//* Error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

//* Extra packages
app.set('trust proxy', 1);
app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
    })
);
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(xss());

//* Routes
app.get('/', (req, res) => {
    res.send('<h1>Jobs API</h1><a href="./api-docs">API Docs</a>');
});

app.use('/api-docs', swagger.serve, swagger.setup(swaggerDoc));

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/jobs', authenticateUser, jobsRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        app.listen(port, console.log(`Server is listening on port ${port}...`));
    } catch (error) {
        console.log(error);
    }
};

start();
