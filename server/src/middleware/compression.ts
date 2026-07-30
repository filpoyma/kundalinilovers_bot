import compression from 'compression';
import { Express } from 'express';

const compressionMiddleware = (app: Express): void => {
  app.use(
    compression({
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return false;
        }
        return compression.filter(req, res);
      },
      level: 6,
    })
  );
};

export default compressionMiddleware;

