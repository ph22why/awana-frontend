"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupLogging = void 0;
const winston_1 = __importDefault(require("winston"));
const logger = winston_1.default.createLogger({
    level: 'info',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.printf(({ timestamp, level, message }) => {
        return `${timestamp} ${level}: ${JSON.stringify(message)}`;
    })),
    transports: [
        new winston_1.default.transports.File({ filename: 'error.log', level: 'error' }),
        new winston_1.default.transports.File({ filename: 'combined.log' })
    ]
});
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston_1.default.transports.Console({
        format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple(), winston_1.default.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} ${level}: ${JSON.stringify(message)}`;
        }))
    }));
}
const setupLogging = (app) => {
    app.use((req, res, next) => {
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
exports.setupLogging = setupLogging;
