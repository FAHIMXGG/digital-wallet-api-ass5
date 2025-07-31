
import { Types } from "mongoose";
import config from "../../config";
import { IUser, User } from "../user/user.model";
import { Wallet } from "../wallet/wallet.model";
import jwt, { SignOptions } from "jsonwebtoken";
import { StringValue as MsStringValue } from 'ms';

const registerUser = async (payload: IUser) => {
  const newUser = new User(payload);
  const user = await newUser.save();

  const wallet = new Wallet({
    userId: user._id,
    balance: config.initial_wallet_balance,
  });
  await wallet.save();

  user.wallet = wallet._id as Types.ObjectId;
  await user.save();

  return user;
};

const loginUser = async (email: string, password_plain: string) => {
  const user = await User.findOne({ email }).select('+password') as (IUser | null);

  if (!user || !(await user.comparePassword(password_plain))) {
    throw new Error('Invalid credentials');
  }

  if (user.role === 'agent' && user.isApproved === false) {
    throw new Error('Agent not yet approved by admin.');
  }

  const userId = user._id as Types.ObjectId;

  const payload = {
    id: userId.toHexString(),
    role: user.role,
  };

  const options: SignOptions = {

    expiresIn: config.jwt_expires_in as MsStringValue,
  };

  const token = jwt.sign(
    payload,
    config.jwt_secret,
    options
  );

  return { user, token };
};

export const AuthService = {
  registerUser,
  loginUser,
};