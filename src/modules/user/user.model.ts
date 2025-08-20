import { Schema, model, Types, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import config from '../../config';
export type UserRole = 'user' | 'agent' | 'admin';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: UserRole;
  isApproved?: boolean;
  isEmailVerified?: boolean;
  wallet?: Types.ObjectId;
  comparePassword: (candidatePassword: string) => Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: 0,
    },
    phone: { 
      type: String,
      unique: true, 
      sparse: true, 
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'agent', 'admin'],
      required: true,
    },
    isApproved: {
      type: Boolean,
      default: function (this: IUser) {
        return this.role !== 'agent';
      },
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    wallet: {
      type: Schema.Types.ObjectId,
      ref: 'Wallet',
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password as string, Number(config.BCRYPT_SALT_ROUND));
  }
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password as string);
};

export const User = model<IUser>('User', userSchema);