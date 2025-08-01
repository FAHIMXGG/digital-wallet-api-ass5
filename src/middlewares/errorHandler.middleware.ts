import { Request, Response, } from 'express';
import sendResponse from '../utils/apiResponse';
const errorHandler = (err: any, req: Request, res: Response) => {
  console.error(err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong!';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error: ' + err.message;
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate key error: ' + Object.keys(err.keyValue)[0] + ' already exists.';
  }

  sendResponse(res, {
    statusCode,
    success: false,
    message,
  });
};

export default errorHandler;