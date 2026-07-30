import { body, validationResult, ValidationChain } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '../constants/status.constants';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: {
        message: 'Validation error',
        errors: errors.array(),
      },
    });
  };
};

export const sanitizeString = (field: string) => {
  return body(field)
    .trim()
    .escape()
    .notEmpty()
    .withMessage(`${field} is required`);
};

export const sanitizeEmail = (field: string = 'email') => {
  return body(field)
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Invalid email format');
};

export const sanitizeObjectId = (field: string) => {
  return body(field)
    .trim()
    .matches(/^[0-9a-fA-F]{24}$/)
    .withMessage(`Invalid ${field} format`);
};

