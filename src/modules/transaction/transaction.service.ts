import { Transaction } from './transaction.model';

const getMyTransactions = async (userId: string) => {
  const transactions = await Transaction.find({
    $or: [{ sender: userId }, { receiver: userId }],
  }).sort({ createdAt: -1 });
  return transactions;
};

const getAllTransactions = async (query: any) => {
  const transactions = await Transaction.find(query).populate('sender receiver').sort({ createdAt: -1 });
  return transactions;
};

export const TransactionService = {
  getMyTransactions,
  getAllTransactions,
};