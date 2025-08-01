import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateRegister, validateLogin } from '../../middlewares/validation.middleware';
import catchAsync from '../../utils/catchAsync';

const router = Router();

router.post('/register', catchAsync(validateRegister), AuthController.register);
router.post('/login', catchAsync(validateLogin), AuthController.login);

export const AuthRoutes = router;