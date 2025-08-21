import { Request, Response } from 'express';
import { UserService } from './user.service';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/apiResponse';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}
// todo

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await UserService.getAllUsers(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Users fetched successfully!',
    data: users,
  });
});

const getSingleUser = catchAsync(async (req: Request, res: Response) => {
  const user = await UserService.getSingleUser(req.params.id);
  if (!user) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: 'User not found!',
    });
  }
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User fetched successfully!',
    data: user,
  });
});


const approveAgent = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params; 
  const agent = await UserService.approveAgent(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Agent approved successfully!',
    data: agent,
  });
});

const suspendAgent = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params; 
  const agent = await UserService.suspendAgent(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Agent suspended successfully!',
    data: agent,
  });
});

const getMe = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return sendResponse(res, {
      statusCode: 401,
      success: false,
      message: 'Unauthorized: No user data',
    });
  }

  const user = await UserService.getSingleUser(req.user.id);
  if (!user) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: 'User not found!',
    });
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User profile fetched successfully!',
    data: user,
  });
});

export const UserController = {
  getAllUsers,
  getSingleUser,
  approveAgent, 
  suspendAgent, 
  getMe
};