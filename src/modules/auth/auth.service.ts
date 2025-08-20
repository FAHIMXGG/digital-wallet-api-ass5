
import { Types } from "mongoose";
import config from "../../config";
import { IUser, User } from "../user/user.model";
import { Wallet } from "../wallet/wallet.model";
import jwt, { SignOptions } from "jsonwebtoken";
import { StringValue as MsStringValue } from 'ms';
import { ValidationError, DuplicateError, AuthenticationError, AuthorizationError } from "../../utils/customError";
import { createOTP, verifyOTP } from "../../utils/otpUtils";
import { sendEmailVerificationOTP, sendWelcomeEmail, sendPasswordResetOTP } from "../../services/emailService";

const registerUser = async (payload: IUser) => {
  // Validate required fields
  if (!payload.name || !payload.email || !payload.password || !payload.phone || !payload.role) {
    const missingFields = [];
    if (!payload.name) missingFields.push('name');
    if (!payload.email) missingFields.push('email');
    if (!payload.password) missingFields.push('password');
    if (!payload.phone) missingFields.push('phone');
    if (!payload.role) missingFields.push('role');

    throw new ValidationError(`Missing required fields: ${missingFields.join(', ')}`);
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(payload.email)) {
    throw new ValidationError('Please provide a valid email address');
  }

  // Validate role
  const validRoles = ['user', 'agent', 'admin'];
  if (!validRoles.includes(payload.role)) {
    throw new ValidationError(`Role must be one of: ${validRoles.join(', ')}`);
  }

  // Validate password strength
  if (payload.password.length < 6) {
    throw new ValidationError('Password must be at least 6 characters long');
  }

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [
      { email: payload.email },
      { phone: payload.phone }
    ]
  });

  if (existingUser) {
    if (existingUser.email === payload.email) {
      throw new DuplicateError('email');
    }
    if (existingUser.phone === payload.phone) {
      throw new DuplicateError('phone');
    }
  }

  const newUser = new User(payload);
  const user = await newUser.save();

  const wallet = new Wallet({
    userId: user._id,
    balance: config.initial_wallet_balance,
  });
  await wallet.save();

  user.wallet = wallet._id as Types.ObjectId;
  await user.save();

  // Send email verification OTP
  try {
    const userId = user._id as Types.ObjectId;
    const otp = await createOTP(user.email, 'email_verification', userId.toString());
    await sendEmailVerificationOTP(user.email, user.name, otp);
  } catch {
    // Don't fail registration if email sending fails
    // In production, you might want to log this to a proper logging service
  }

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  return userResponse;
};

const loginUser = async (email: string, password_plain: string) => {
  // Validate required fields
  if (!email || !password_plain) {
    const missingFields = [];
    if (!email) missingFields.push('email');
    if (!password_plain) missingFields.push('password');

    throw new ValidationError(`Missing required fields: ${missingFields.join(', ')}`);
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Please provide a valid email address');
  }

  const user = await User.findOne({ email }).select('+password') as (IUser | null);

  if (!user || !(await user.comparePassword(password_plain))) {
    throw new AuthenticationError('Invalid credentials');
  }

  if (!user.isEmailVerified) {
    throw new AuthorizationError('Please verify your email before logging in.');
  }

  if (user.role === 'agent' && user.isApproved === false) {
    throw new AuthorizationError('Agent not yet approved by admin.');
  }

  const userId = user._id as Types.ObjectId;

  const payload = {
    id: userId.toHexString(),
    role: user.role,
  };

  const options: SignOptions = {

    expiresIn: config.jwt_expires_in as MsStringValue,
  };

  if (!config.jwt_secret) {
    throw new Error('JWT secret is not defined in configuration.');
  }
  const token = jwt.sign(
    payload,
    config.jwt_secret,
    options
  );

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  return { user: userResponse, token };
};

const verifyEmail = async (email: string, otp: string) => {
  // Validate required fields
  if (!email || !otp) {
    const missingFields = [];
    if (!email) missingFields.push('email');
    if (!otp) missingFields.push('otp');
    throw new ValidationError(`Missing required fields: ${missingFields.join(', ')}`);
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Please provide a valid email address');
  }

  // Verify OTP
  await verifyOTP(email, otp, 'email_verification');

  // Find and update user
  const user = await User.findOne({ email });
  if (!user) {
    throw new ValidationError('User not found');
  }

  if (user.isEmailVerified) {
    throw new ValidationError('Email is already verified');
  }

  user.isEmailVerified = true;
  await user.save();

  // Send welcome email
  try {
    await sendWelcomeEmail(user.email, user.name);
  } catch {
    // Don't fail verification if welcome email sending fails
  }

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  return userResponse;
};

const resendVerificationEmail = async (email: string) => {
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Please provide a valid email address');
  }

  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    throw new ValidationError('User not found');
  }

  if (user.isEmailVerified) {
    throw new ValidationError('Email is already verified');
  }

  // Generate and send new OTP
  const userId = user._id as Types.ObjectId;
  const otp = await createOTP(user.email, 'email_verification', userId.toString());
  await sendEmailVerificationOTP(user.email, user.name, otp);

  return { message: 'Verification email sent successfully' };
};

const forgotPassword = async (email: string) => {
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Please provide a valid email address');
  }

  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    throw new ValidationError('User not found');
  }

  if (!user.isEmailVerified) {
    throw new ValidationError('Please verify your email first');
  }

  // Generate and send OTP
  const userId = user._id as Types.ObjectId;
  const otp = await createOTP(user.email, 'password_reset', userId.toString());
  await sendPasswordResetOTP(user.email, user.name, otp);

  return { message: 'Password reset OTP sent to your email' };
};

const resetPassword = async (email: string, otp: string, newPassword: string) => {
  // Validate required fields
  if (!email || !otp || !newPassword) {
    const missingFields = [];
    if (!email) missingFields.push('email');
    if (!otp) missingFields.push('otp');
    if (!newPassword) missingFields.push('newPassword');
    throw new ValidationError(`Missing required fields: ${missingFields.join(', ')}`);
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Please provide a valid email address');
  }

  // Validate password strength
  if (newPassword.length < 6) {
    throw new ValidationError('Password must be at least 6 characters long');
  }

  // Verify OTP
  await verifyOTP(email, otp, 'password_reset');

  // Find and update user
  const user = await User.findOne({ email });
  if (!user) {
    throw new ValidationError('User not found');
  }

  user.password = newPassword;
  await user.save();

  return { message: 'Password reset successfully' };
};

const changePassword = async (userId: string, currentPassword: string, newPassword: string) => {
  // Validate required fields
  if (!currentPassword || !newPassword) {
    const missingFields = [];
    if (!currentPassword) missingFields.push('currentPassword');
    if (!newPassword) missingFields.push('newPassword');
    throw new ValidationError(`Missing required fields: ${missingFields.join(', ')}`);
  }

  // Validate password strength
  if (newPassword.length < 6) {
    throw new ValidationError('New password must be at least 6 characters long');
  }

  // Find user with password
  const user = await User.findById(userId).select('+password') as (IUser | null);
  if (!user) {
    throw new ValidationError('User not found');
  }

  // Verify current password
  if (!(await user.comparePassword(currentPassword))) {
    throw new AuthenticationError('Current password is incorrect');
  }

  // Update password
  user.password = newPassword;
  await user.save();

  return { message: 'Password changed successfully' };
};

export const AuthService = {
  registerUser,
  loginUser,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  changePassword,
};