import { Request, Response } from 'express';
import { WalletService } from './wallet.service';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/apiResponse';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

const getMyWallet = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const wallet = await WalletService.getMyWallet(req.user!.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Wallet fetched successfully!',
    data: wallet,
  });
});

const blockUnblockWallet = catchAsync(async (req: Request, res: Response) => {
  const { walletId } = req.params;
  const { isBlocked } = req.body;
  const wallet = await WalletService.blockUnblockWallet(walletId, isBlocked);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `Wallet ${isBlocked ? 'blocked' : 'unblocked'} successfully!`,
    data: wallet,
  });
});

const addMoney = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { amount } = req.body;
  const { role, id: agentId } = req.user!;

  // Validate amount is a number (strict type checking)
  if (!amount || typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: 'Amount must be a valid positive number, not a string.'
    });
  }

  if (role === 'agent') {
    const { userId } = req.body;
    if (!userId) {
      return sendResponse(res, { statusCode: 400, success: false, message: 'User ID is required for agent cash-in.' });
    }
    const { userWallet, agentWallet } = await WalletService.cashInByAgent(agentId, userId, amount);
    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Cash-in successful! Agent received commission.',
      data: { userWallet, agentWallet },
    });
  } else {
    const wallet = await WalletService.addMoney(req.user!.id, amount);
    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Money added successfully!',
      data: wallet,
    });
  }
});

const withdrawMoney = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { amount } = req.body;

  if (!amount || typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: 'Amount must be a valid positive number, not a string.'
    });
  }

  const wallet = await WalletService.withdrawMoney(req.user!.id, amount);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Money withdrawn successfully!',
    data: wallet,
  });
});

const sendMoney = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { receiverId, amount } = req.body;

  if (!amount || typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: 'Amount must be a valid positive number, not a string.'
    });
  }

  const { senderWallet, receiverWallet } = await WalletService.sendMoney(req.user!.id, receiverId, amount);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Money sent successfully!',
    data: { senderWallet, receiverWallet },
  });
});

const cashOut = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { userId, amount } = req.body;

  if (!amount || typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: 'Amount must be a valid positive number, not a string.'
    });
  }

  const { userWallet, agentWallet } = await WalletService.cashOut(req.user!.id, userId, amount);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Cash-out successful! Agent received commission.',
    data: { userWallet, agentWallet },
  });
});

const getAllWallets = catchAsync(async (req: Request, res: Response) => {
  const result = await WalletService.getAllWallets(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All wallets fetched successfully!',
    data: result,
  });
});

export const WalletController = {
  getMyWallet,
  blockUnblockWallet,
  addMoney,
  withdrawMoney,
  sendMoney,
  cashOut,
  getAllWallets,
};