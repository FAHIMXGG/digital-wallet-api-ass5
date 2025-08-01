export class CustomError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError);
    }

    this.name = this.constructor.name;
  }
}

export class ValidationError extends CustomError {
  constructor(message: string) {
    super(`Validation Error: ${message}`, 400);
  }
}

export class DuplicateError extends CustomError {
  constructor(field: string) {
    super(`Duplicate key error: ${field} already exists.`, 409);
  }
}

export class AuthenticationError extends CustomError {
  constructor(message: string = 'Invalid credentials') {
    super(message, 401);
  }
}

export class AuthorizationError extends CustomError {
  constructor(message: string = 'You are forbidden to access this resource!') {
    super(message, 403);
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}
