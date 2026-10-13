import express, { Express } from 'express';
import cors from 'cors';

import routes from './src/routes';
import requestLogger from './src/middleware/requestLogger';
import errorHandler from './src/middleware/errors/errorHandler';
import notFoundErrorHandler from './src/middleware/errors/notFoundErrorHandler';
import helmetMiddleware from './src/middleware/security/helmetSecurity';
import { generalRateLimiter } from './src/middleware/security/rateLimiter';
import mongoSanitizeMiddleware from './src/middleware/security/mongoSanitize';
import requestId from './src/middleware/security/requestId';
import compressionMiddleware from './src/middleware/compression';
import corsOptions from './src/config/cors';

const app: Express = express();

// Security middleware (должен быть первым)
helmetMiddleware(app);

// Compression
compressionMiddleware(app);

// Request ID
app.use(requestId);

// CORS с настройками
app.use(cors(corsOptions));

// Body parsing с ограничением размера
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// MongoDB sanitization
mongoSanitizeMiddleware(app);

// Rate limiting
app.use(generalRateLimiter);

// Request logging
app.use(requestLogger);

// Routes
app.use('/api/kundalinilovers-bot', routes);

app.use(notFoundErrorHandler);
app.use(errorHandler);

export default app;
