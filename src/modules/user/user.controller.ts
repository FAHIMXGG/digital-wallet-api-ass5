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

const updateMe = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return sendResponse(res, {
      statusCode: 401,
      success: false,
      message: 'Unauthorized: No user data',
    });
  }

  const { name, phone } = req.body;

  const updatedUser = await UserService.updateMe(req.user.id, { name, phone });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Profile updated successfully!',
    data: updatedUser,
  });
});

const searchUsers = catchAsync(async (req: Request, res: Response) => {
  const search = (req.query.search as string) || '';
  const limit = parseInt((req.query.limit as string) || '10', 10);

  const users = await UserService.searchUsers(search, limit);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: users.length > 0 ? 'Users found successfully!' : 'No users found!',
    data: users,
  });
});

export const UserController = {
  getAllUsers,
  getSingleUser,
  approveAgent, 
  suspendAgent, 
  getMe,
  updateMe,
  searchUsers
};