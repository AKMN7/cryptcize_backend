const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cors = require('cors');

// Utils
const AppError = require('./utils/appError');
const ErrorHandler = require('./utils/errorHandler');

// Application Route Handlers
const userRouter = require('./routes/userRoutes');
const postRouter = require('./routes/postRoutes');
const topicRouter = require('./routes/topicRoutes');
const mainRouter = require('./routes/mainRoutes');


const app = express();


// Set security HTTP headers
app.use(helmet());


// Development logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}


// Limit requests from same API
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!'
});

app.use('/api', limiter);


// Body parser, reading data from body into req.body
app.use(express.json({ limit: '1000kb' }));


// Data sanitization against NoSQL query injection
app.use(mongoSanitize());


// Data sanitization against XSS
app.use(xss());


// Overrule CORS protocol
app.use(cors());
app.options('*', cors());

app.use((_, res, next) => {
    res.header('Access-Control-Allow-Headers, *, Access-Control-Allow-Origin', 'Origin, X-Requested-with, Content_Type,Accept,Authorization', 'http://localhost:8080');
    next();
});

// PING ROUTE
app.get('/', (_, res, _1) => {
    res.status(200).json({ message: 'CRYPTCIZE IS READY TO GO' });
});

// APPLICATION ROUTES
app.use('/api/v1/users', userRouter);
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/topics', topicRouter);
app.use('/api/v1/main', mainRouter);


// Unfound Route
app.all('*', (req, _, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});


// Application Error Handler
app.use(ErrorHandler);

module.exports = app;