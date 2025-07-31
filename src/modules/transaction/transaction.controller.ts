import { Request, Response } from 'express';
import { TransactionService } from './transaction.service';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/apiResponse';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

const getMyTransactions = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const transactions = await TransactionService.getMyTransactions(req.user!.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Transaction history fetched successfully!',
    data: transactions,
  });
});

const getAllTransactions = catchAsync(async (req: Request, res: Response) => {
  const transactions = await TransactionService.getAllTransactions(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All transactions fetched successfully!',
    data: transactions,
  });
});

export const TransactionController = {
  getMyTransactions,
  getAllTransactions,
};