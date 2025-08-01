
import { Types } from "mongoose";
import config from "../../config";
import { IUser, User } from "../user/user.model";
import { Wallet } from "../wallet/wallet.model";
import jwt, { SignOptions } from "jsonwebtoken";
import { StringValue as MsStringValue } from 'ms';
import { ValidationError, DuplicateError, AuthenticationError, AuthorizationError } from "../../utils/customError";

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

export const AuthService = {
  registerUser,
  loginUser,
};