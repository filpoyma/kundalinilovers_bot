import mongoSanitize from 'express-mongo-sanitize';
import { Express } from 'express';
import logger from '../../config/logger';

const mongoSanitizeMiddleware = (app: Express): void => {
  app.use(
    mongoSanitize({
      replaceWith: '_',
      onSanitize: ({ req, key }) => {
        logger.warn(`MongoDB injection attempt detected: ${key} in ${req.url}`);
      },
    })
  );
};

export default mongoSanitizeMiddleware;

