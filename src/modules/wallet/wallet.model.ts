import { Schema, model, Types, Document } from 'mongoose';

export interface IWallet extends Document {
  userId: Types.ObjectId;
  balance: number;
  isBlocked: boolean;
  dailySpentAmount: number;
  dailyTransactionCount: number;
  lastDailyReset: Date;
  monthlySpentAmount: number;
  monthlyTransactionCount: number;
  lastMonthlyReset: Date;
}

const walletSchema = new Schema<IWallet>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    dailySpentAmount: { type: Number, default: 0 },
    dailyTransactionCount: { type: Number, default: 0 },
    lastDailyReset: { type: Date, default: Date.now },
    monthlySpentAmount: { type: Number, default: 0 },
    monthlyTransactionCount: { type: Number, default: 0 },
    lastMonthlyReset: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const Wallet = model<IWallet>('Wallet', walletSchema);