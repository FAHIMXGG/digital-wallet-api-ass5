import { Wallet, IWallet } from './wallet.model';
import { User } from '../user/user.model';
import { Transaction, ITransactionInput } from '../transaction/transaction.model';
import mongoose, { Types } from 'mongoose';
import config from '../../config';
import { NotificationService } from '../../utils/notification';


const getMyWallet = async (userId: string) => {
  const wallet = await Wallet.findOne({ userId });
  return wallet;
};

const blockUnblockWallet = async (walletId: string, isBlocked: boolean) => {
  const wallet = await Wallet.findByIdAndUpdate(walletId, { isBlocked }, { new: true });
  if (!wallet) {
    throw new Error('Wallet not found');
  }
  return wallet;
};

const checkWalletStatusAndBalance = async (currentUserId: Types.ObjectId, amount: number) => {
  const wallet = await Wallet.findOne({ userId: currentUserId });
  if (!wallet) {
    throw new Error('Wallet not found.');
  }
  if (wallet.isBlocked) {
    throw new Error('Wallet is blocked. Cannot perform operations.');
  }
  if (wallet.balance < amount) {
    throw new Error('Insufficient balance.');
  }
  return wallet;
};

const checkAndResetLimits = (wallet: IWallet) => {
  const now = new Date();

  const lastDaily = new Date(wallet.lastDailyReset);
  if (now.getDate() !== lastDaily.getDate() || now.getMonth() !== lastDaily.getMonth() || now.getFullYear() !== lastDaily.getFullYear()) {
    wallet.dailySpentAmount = 0;
    wallet.dailyTransactionCount = 0;
    wallet.lastDailyReset = now;
  }

  const lastMonthly = new Date(wallet.lastMonthlyReset);
  if (now.getMonth() !== lastMonthly.getMonth() || now.getFullYear() !== lastMonthly.getFullYear()) {
    wallet.monthlySpentAmount = 0;
    wallet.monthlyTransactionCount = 0;
    wallet.lastMonthlyReset = now;
  }
  return wallet;
};

const applyLimitsCheck = (wallet: IWallet, amount: number) => {
    if (wallet.dailySpentAmount + amount > config.daily_transaction_limit_amount) {
        throw new Error(`Daily spending limit exceeded. Remaining: ${config.daily_transaction_limit_amount - wallet.dailySpentAmount}`);
    }
    if (wallet.dailyTransactionCount + 1 > config.daily_transaction_limit_count) {
        throw new Error(`Daily transaction count limit exceeded. Remaining: ${config.daily_transaction_limit_count - wallet.dailyTransactionCount}`);
    }
    if (wallet.monthlySpentAmount + amount > config.monthly_transaction_limit_amount) {
        throw new Error(`Monthly spending limit exceeded. Remaining: ${config.monthly_transaction_limit_amount - wallet.monthlyTransactionCount}`);
    }
    if (wallet.monthlyTransactionCount + 1 > config.monthly_transaction_limit_count) {
        throw new Error(`Monthly transaction count limit exceeded. Remaining: ${config.monthly_transaction_limit_count - wallet.monthlyTransactionCount}`);
    }
}


const addMoney = async (userId: string, amount: number) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const wallet = await Wallet.findOne({ userId }).session(session);
    if (!wallet) {
      throw new Error('Wallet not found for this user.');
    }
    if (wallet.isBlocked) {
      throw new Error('Your wallet is blocked. Cannot add money.');
    }

    wallet.balance += amount;
    await wallet.save({ session });

    const transactionData: ITransactionInput = {
      sender: new Types.ObjectId(userId),
      amount,
      type: 'add_money',
      status: 'completed',
      description: `Money added to wallet by user`,
    };
    const createdTransactions = await Transaction.create([transactionData], { session });
    const savedTransaction = createdTransactions[0];

    await session.commitTransaction();
    session.endSession();
    
    NotificationService.sendTransactionNotification(savedTransaction, 'User Top-up');

    return wallet;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const withdrawMoney = async (userId: string, amount: number) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const wallet = await checkWalletStatusAndBalance(new Types.ObjectId(userId), amount);
    if (!wallet) {
      throw new Error('Wallet not found for this user.');
    }

    checkAndResetLimits(wallet);
    applyLimitsCheck(wallet, amount);

    wallet.balance -= amount;
    wallet.dailySpentAmount += amount;
    wallet.dailyTransactionCount += 1;
    wallet.monthlySpentAmount += amount;
    wallet.monthlyTransactionCount += 1;
    await wallet.save({ session });


    const transactionData: ITransactionInput = {
      sender: new Types.ObjectId(userId),
      amount,
      type: 'withdraw',
      status: 'completed',
      description: 'Money withdrawn from wallet',
    };
    const createdTransactions = await Transaction.create([transactionData], { session });
    const savedTransaction = createdTransactions[0];

    await session.commitTransaction();
    session.endSession();
    NotificationService.sendTransactionNotification(savedTransaction, 'User Withdrawal');
    

    return wallet;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const sendMoney = async (senderId: string, receiverId: string, amount: number) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (senderId === receiverId) {
      throw new Error('Cannot send money to yourself.');
    }

    const senderWallet = await checkWalletStatusAndBalance(new Types.ObjectId(senderId), amount);
    if (!senderWallet) {
      throw new Error('Sender wallet not found.');
    }

    checkAndResetLimits(senderWallet);
    applyLimitsCheck(senderWallet, amount);


    const receiverWallet = await Wallet.findOne({ userId: receiverId }).session(session);
    if (!receiverWallet) {
      throw new Error('Receiver wallet not found.');
    }
    if (receiverWallet.isBlocked) {
      throw new Error('Receiver wallet is blocked. Cannot send money.');
    }

    senderWallet.balance -= amount;
    senderWallet.dailySpentAmount += amount;
    senderWallet.dailyTransactionCount += 1;
    senderWallet.monthlySpentAmount += amount;
    senderWallet.monthlyTransactionCount += 1;
    await senderWallet.save({ session });

    receiverWallet.balance += amount;
    await receiverWallet.save({ session });


    const transactionData: ITransactionInput = {
      sender: new Types.ObjectId(senderId),
      receiver: new Types.ObjectId(receiverId),
      amount,
      type: 'send_money',
      status: 'completed',
      description: `Money sent from ${senderId} to ${receiverId}`,
    };
    const createdTransactions = await Transaction.create([transactionData], { session });
    const savedTransaction = createdTransactions[0];

    await session.commitTransaction();
    session.endSession();
    NotificationService.sendTransactionNotification(savedTransaction, 'User Send Money');
    

    return { senderWallet, receiverWallet };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const cashInByAgent = async (agentId: string, userId: string, amount: number) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const agent = await User.findById(agentId).session(session);
    if (!agent || agent.role !== 'agent' || !agent.isApproved) {
      throw new Error('Agent not found or not approved.');
    }

    const userWallet = await Wallet.findOne({ userId }).session(session);
    if (!userWallet) {
      throw new Error('User wallet not found for cash-in.');
    }
    if (userWallet.isBlocked) {
      throw new Error('User wallet is blocked. Cannot perform cash-in.');
    }

    userWallet.balance += amount;
    await userWallet.save({ session });

    const commissionAmount = amount * config.agent_commission_rate;
    const agentWallet = await Wallet.findOne({ userId: agentId }).session(session);

    if (!agentWallet) {
        throw new Error('Agent wallet not found for commission payout.');
    }
    agentWallet.balance += commissionAmount;
    await agentWallet.save({ session });


    const transactionData: ITransactionInput = {
      sender: new Types.ObjectId(agentId),
      receiver: new Types.ObjectId(userId),
      amount,
      type: 'cash_in',
      status: 'completed',
      commission: commissionAmount,
      description: `Cash-in of ${amount} for user ${userId} by agent ${agentId}. Agent commission: ${commissionAmount.toFixed(2)}`,
    };
    const createdTransactions = await Transaction.create([transactionData], { session });
    const savedTransaction = createdTransactions[0];

    await session.commitTransaction();
    session.endSession();

    NotificationService.sendTransactionNotification(savedTransaction, 'Agent Cash-in');

    return { userWallet, agentWallet };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const cashOut = async (agentId: string, userId: string, amount: number) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const agent = await User.findById(agentId).session(session);
    if (!agent || agent.role !== 'agent' || !agent.isApproved) {
      throw new Error('Agent not found or not approved.');
    }

    const userWallet = await checkWalletStatusAndBalance(new Types.ObjectId(userId), amount);
    if (!userWallet) {
      throw new Error('User wallet not found for cash-out.');
    }
    if (userWallet.isBlocked) {
      throw new Error('User wallet is blocked. Cannot perform cash-out.');
    }

    checkAndResetLimits(userWallet);
    applyLimitsCheck(userWallet, amount);

    userWallet.balance -= amount;
    userWallet.dailySpentAmount += amount;
    userWallet.dailyTransactionCount += 1;
    userWallet.monthlySpentAmount += amount;
    userWallet.monthlyTransactionCount += 1;
    await userWallet.save({ session });


    const commissionAmount = amount * config.agent_commission_rate;
    const agentWallet = await Wallet.findOne({ userId: agentId }).session(session);

    if (!agentWallet) {
        throw new Error('Agent wallet not found for commission payout.');
    }
    agentWallet.balance += commissionAmount;
    await agentWallet.save({ session });


    const transactionData: ITransactionInput = {
      sender: new Types.ObjectId(agentId),
      receiver: new Types.ObjectId(userId),
      amount,
      type: 'cash_out',
      status: 'completed',
      commission: commissionAmount,
      description: `Cash-out of ${amount} for user ${userId} by agent ${agentId}. Agent commission: ${commissionAmount.toFixed(2)}`,
    };
    const createdTransactions = await Transaction.create([transactionData], { session });
    const savedTransaction = createdTransactions[0];

    await session.commitTransaction();
    session.endSession();

    NotificationService.sendTransactionNotification(savedTransaction, 'Agent Cash-out');

    return { userWallet, agentWallet };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const WalletService = {
  getMyWallet,
  blockUnblockWallet,
  addMoney,
  withdrawMoney,
  sendMoney,
  cashInByAgent,
  cashOut,
};