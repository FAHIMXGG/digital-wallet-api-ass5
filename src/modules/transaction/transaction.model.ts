import { Schema, model, Types, Document } from 'mongoose';

export type TransactionType = 'add_money' | 'withdraw' | 'send_money' | 'cash_in' | 'cash_out';
export type TransactionStatus = 'pending' | 'completed' | 'reversed' | 'failed';

export interface ITransaction extends Document {
  sender: Types.ObjectId;
  receiver?: Types.ObjectId;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  fee?: number;
  commission?: number;
  description?: string;
}

export type ITransactionInput = Omit<ITransaction, keyof Document>;


const transactionSchema = new Schema<ITransaction>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: Types.ObjectId,
      ref: 'User',
      required: false,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      enum: ['add_money', 'withdraw', 'send_money', 'cash_in', 'cash_out'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'reversed', 'failed'],
      default: 'completed',
    },
    fee: {
      type: Number,
      default: 0,
    },
    commission: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Transaction = model<ITransaction>('Transaction', transactionSchema);