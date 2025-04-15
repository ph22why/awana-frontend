import { Express } from 'express';
import winston from 'winston';
import { Request, Response, NextFunction } from 'express';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export const setupLogging = (app: Express) => {
  app.use((req: Request, res: Response, next: NextFunction) => {
    logger.info({
      method: req.method,
      path: req.path,
      query: req.query,
      body: req.body
    });
    next();
  });
}; 