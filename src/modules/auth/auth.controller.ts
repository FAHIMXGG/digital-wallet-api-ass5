import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/apiResponse';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

const register = catchAsync(async (req: Request, res: Response) => {
  const user = await AuthService.registerUser(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'User registered successfully!',
    data: user,
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { user, token } = await AuthService.loginUser(email, password);

  // 🍪 Set JWT in cookie
  res.cookie('accessToken', token, {
    httpOnly: true, // prevents access from JavaScript
    secure: true, // HTTPS only in production
    sameSite: 'none', // prevents CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User logged in successfully!',
    data: { user }, // we don't need to send token anymore
  });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  // Clear the cookie
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: true,
    sameSite: 'none', // match your login cookie settings
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User logged out successfully!',
  });
});

const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  const user = await AuthService.verifyEmail(email, otp);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Email verified successfully!',
    data: user,
  });
});

const resendVerificationEmail = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await AuthService.resendVerificationEmail(email);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
  });
});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await AuthService.forgotPassword(email);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;
  const result = await AuthService.resetPassword(email, otp, newPassword);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
  });
});

const changePassword = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return sendResponse(res, {
      statusCode: 401,
      success: false,
      message: 'User not authenticated',
    });
  }

  const result = await AuthService.changePassword(userId, currentPassword, newPassword);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
  });
});

export const AuthController = {
  register,
  login,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  logout
};
