import crypto from 'crypto';
import { OTP, IOTP, OTPType } from '../modules/otp/otp.model';
import config from '../config';
import { ValidationError } from './customError';

/**
 * Generate a 6-digit OTP
 */
export const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Create and save OTP to database
 */
export const createOTP = async (
  email: string, 
  type: OTPType, 
  userId?: string
): Promise<string> => {
  // Invalidate any existing unused OTPs for this email and type
  await OTP.updateMany(
    { email, type, isUsed: false },
    { isUsed: true }
  );

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + config.otp_expires_in * 1000);

  const otpDoc = new OTP({
    email,
    otp,
    type,
    expiresAt,
    userId,
  });

  await otpDoc.save();
  return otp;
};

/**
 * Verify OTP
 */
export const verifyOTP = async (
  email: string,
  otp: string,
  type: OTPType
): Promise<IOTP> => {
  const otpDoc = await OTP.findOne({
    email,
    otp,
    type,
    isUsed: false,
    expiresAt: { $gt: new Date() },
  });

  if (!otpDoc) {
    throw new ValidationError('Invalid or expired OTP');
  }

  // Mark OTP as used
  otpDoc.isUsed = true;
  await otpDoc.save();

  return otpDoc;
};

/**
 * Clean up expired OTPs (optional utility function)
 */
export const cleanupExpiredOTPs = async (): Promise<void> => {
  await OTP.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { isUsed: true }
    ]
  });
};
