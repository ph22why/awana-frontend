import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError } from 'express-validator';

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((err: ValidationError) => {
        let field: string;
        switch (err.type) {
          case 'field':
            field = err.path;
            break;
          case 'alternative':
          case 'alternative_grouped':
          case 'unknown_fields':
            field = err.type;
            break;
          default:
            field = 'unknown';
        }
        return {
          field,
          message: err.msg
        };
      })
    });
  }
  next();
}; 