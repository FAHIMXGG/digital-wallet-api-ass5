import { Schema, model, Document, Types } from 'mongoose';

export type OTPType = 'email_verification' | 'password_reset';

export interface IOTP extends Document {
  email: string;
  otp: string;
  type: OTPType;
  expiresAt: Date;
  isUsed: boolean;
  userId?: Types.ObjectId;
}

const otpSchema = new Schema<IOTP>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['email_verification', 'password_reset'],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // MongoDB TTL index
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
otpSchema.index({ email: 1, type: 1, isUsed: 1 });

export const OTP = model<IOTP>('OTP', otpSchema);
