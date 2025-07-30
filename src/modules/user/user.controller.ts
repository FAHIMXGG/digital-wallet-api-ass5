import { Request, Response } from 'express';
import { UserService } from './user.service';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/apiResponse';

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

export const UserController = {
  getAllUsers,
  getSingleUser,
  approveAgent, 
  suspendAgent, 
};