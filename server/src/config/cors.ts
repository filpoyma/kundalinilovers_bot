import { CorsOptions } from 'cors';
import logger from './logger';
import {isDevelopment, isProduction} from '../constants/system.constants';

const corsOrigin = (isProduction ? process.env.CORS_ORIGIN_PROD : process.env.CORS_ORIGIN_DEV) || ''
const allowedOrigins = corsOrigin.split(',').map((origin) => origin.trim())
if (!corsOrigin) logger.warn('No CORS ORIGIN ADDED')

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.indexOf(origin) !== -1 || isDevelopment) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  exposedHeaders: ['X-Request-Id'],
  maxAge: 86400, // 24 часа
};

export default corsOptions;

