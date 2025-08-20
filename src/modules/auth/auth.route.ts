import { Router } from 'express';
import { AuthController } from './auth.controller';
import {
  validateRegister,
  validateLogin,
  validateVerifyEmail,
  validateResendVerification,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword
} from '../../middlewares/validation.middleware';
import catchAsync from '../../utils/catchAsync';
import auth from '../../middlewares/auth.middleware';

const router = Router();

// Public routes
router.post('/register', catchAsync(validateRegister), AuthController.register);
router.post('/login', catchAsync(validateLogin), AuthController.login);
router.post('/verify-email', catchAsync(validateVerifyEmail), AuthController.verifyEmail);
router.post('/resend-verification', catchAsync(validateResendVerification), AuthController.resendVerificationEmail);
router.post('/forgot-password', catchAsync(validateForgotPassword), AuthController.forgotPassword);
router.post('/reset-password', catchAsync(validateResetPassword), AuthController.resetPassword);

// Protected routes
router.post('/change-password', auth('user', 'agent', 'admin'), catchAsync(validateChangePassword), AuthController.changePassword);

export const AuthRoutes = router;