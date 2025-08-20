import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/customError';

// Validation schemas
export const registerValidationSchema = {
  name: {
    required: true,
    type: 'string' as const,
    minLength: 2,
    maxLength: 50
  },
  email: {
    required: true,
    type: 'string' as const,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    required: true,
    type: 'string' as const,
    minLength: 6,
    maxLength: 100
  },
  phone: {
    required: true,
    type: 'string' as const,
    pattern: /^[0-9+\-\s()]+$/,
    minLength: 10,
    maxLength: 15
  },
  role: {
    required: true,
    type: 'string' as const,
    enum: ['user', 'agent', 'admin']
  }
};

export const loginValidationSchema = {
  email: {
    required: true,
    type: 'string' as const,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    required: true,
    type: 'string' as const,
    minLength: 1
  }
};

export const verifyEmailValidationSchema = {
  email: {
    required: true,
    type: 'string' as const,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  otp: {
    required: true,
    type: 'string' as const,
    pattern: /^[0-9]{6}$/
  }
};

export const resendVerificationValidationSchema = {
  email: {
    required: true,
    type: 'string' as const,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  }
};

export const forgotPasswordValidationSchema = {
  email: {
    required: true,
    type: 'string' as const,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  }
};

export const resetPasswordValidationSchema = {
  email: {
    required: true,
    type: 'string' as const,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  otp: {
    required: true,
    type: 'string' as const,
    pattern: /^[0-9]{6}$/
  },
  newPassword: {
    required: true,
    type: 'string' as const,
    minLength: 6,
    maxLength: 100
  }
};

export const changePasswordValidationSchema = {
  currentPassword: {
    required: true,
    type: 'string' as const,
    minLength: 1
  },
  newPassword: {
    required: true,
    type: 'string' as const,
    minLength: 6,
    maxLength: 100
  }
};

interface ValidationRule {
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: string[];
}

interface ValidationSchema {
  [key: string]: ValidationRule;
}

const validateField = (fieldName: string, value: unknown, rule: ValidationRule): string[] => {
  const errors: string[] = [];

  // Check if required field is missing
  if (rule.required && (value === undefined || value === null || value === '')) {
    errors.push(`${fieldName} is required`);
    return errors; // Return early if required field is missing
  }

  // Skip validation if field is not required and not provided
  if (!rule.required && (value === undefined || value === null || value === '')) {
    return errors;
  }

  // Type validation
  if (rule.type) {
    const actualType = Array.isArray(value) ? 'array' : typeof value;
    if (actualType !== rule.type) {
      errors.push(`${fieldName} must be of type ${rule.type}`);
      return errors; // Return early if type is wrong
    }
  }

  // String validations
  if (typeof value === 'string') {
    if (rule.minLength && value.length < rule.minLength) {
      errors.push(`${fieldName} must be at least ${rule.minLength} characters long`);
    }
    if (rule.maxLength && value.length > rule.maxLength) {
      errors.push(`${fieldName} must not exceed ${rule.maxLength} characters`);
    }
    if (rule.pattern && !rule.pattern.test(value)) {
      if (fieldName === 'email') {
        errors.push(`${fieldName} must be a valid email address`);
      } else if (fieldName === 'phone') {
        errors.push(`${fieldName} must be a valid phone number`);
      } else {
        errors.push(`${fieldName} format is invalid`);
      }
    }
  }

  // Number validations
  if (typeof value === 'number') {
    if (rule.min !== undefined && value < rule.min) {
      errors.push(`${fieldName} must be at least ${rule.min}`);
    }
    if (rule.max !== undefined && value > rule.max) {
      errors.push(`${fieldName} must not exceed ${rule.max}`);
    }
  }

  // Enum validation
  if (rule.enum && !rule.enum.includes(value as string)) {
    errors.push(`${fieldName} must be one of: ${rule.enum.join(', ')}`);
  }

  return errors;
};

export const validateRequest = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];

    // Validate each field in the schema
    for (const [fieldName, rule] of Object.entries(schema)) {
      const fieldValue = req.body[fieldName];
      const fieldErrors = validateField(fieldName, fieldValue, rule);
      errors.push(...fieldErrors);
    }

    // If there are validation errors, throw ValidationError
    if (errors.length > 0) {
      throw new ValidationError(errors.join(', '));
    }

    next();
  };
};

// Pre-configured validation middlewares
export const validateRegister = validateRequest(registerValidationSchema);
export const validateLogin = validateRequest(loginValidationSchema);
export const validateVerifyEmail = validateRequest(verifyEmailValidationSchema);
export const validateResendVerification = validateRequest(resendVerificationValidationSchema);
export const validateForgotPassword = validateRequest(forgotPasswordValidationSchema);
export const validateResetPassword = validateRequest(resetPasswordValidationSchema);
export const validateChangePassword = validateRequest(changePasswordValidationSchema);
