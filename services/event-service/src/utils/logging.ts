import { Express } from 'express';
import winston from 'winston';
import { Request, Response, NextFunction } from 'express';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${JSON.stringify(message)}`;
    })
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
      winston.format.printf(({ timestamp, level, message }) => {
        return `${timestamp} ${level}: ${JSON.stringify(message)}`;
      })
    )
  }));
}

export const setupLogging = (app: Express) => {
  app.use((req: Request, res: Response, next: NextFunction) => {
    const logInfo = {
      method: req.method,
      url: req.url,
      path: req.path,
      baseUrl: req.baseUrl,
      originalUrl: req.originalUrl,
      query: req.query,
      body: req.body,
      headers: req.headers
    };
    
    logger.info(logInfo);
    
    // 응답 로깅도 추가
    res.on('finish', () => {
      logger.info({
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        statusMessage: res.statusMessage
      });
    });
    
    next();
  });
}; 