import { Request, Response, NextFunction } from 'express';
import sendResponse from '../utils/apiResponse';
import { CustomError } from '../utils/customError';

interface ErrorWithCode extends Error {
  statusCode?: number;
  code?: number;
  keyValue?: Record<string, unknown>;
  path?: string;
  value?: unknown;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler = (err: ErrorWithCode, _req: Request, res: Response, _next: NextFunction) => {
  // Log error for debugging (in production, use proper logging service)
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong!';

  // Handle custom errors
  if (err instanceof CustomError) {
    statusCode = err.statusCode;
    message = err.message;
  }
  // Handle Mongoose validation errors
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error: ' + err.message;
  }
  // Handle Mongoose duplicate key errors
  else if (err.code === 11000 && err.keyValue) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate key error: ${field} already exists.`;
  }
  // Handle Mongoose CastError (invalid ObjectId)
  else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }
  // Handle JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  sendResponse(res, {
    statusCode,
    success: false,
    message,
  });
};

export default errorHandler;