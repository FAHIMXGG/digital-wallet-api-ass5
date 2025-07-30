import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config';
import { User, UserRole } from '../modules/user/user.model';
import sendResponse from '../utils/apiResponse';
import catchAsync from '../utils/catchAsync';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
  };
}

const auth = (...requiredRoles: UserRole[]) => {
  return catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization; 

    if (!token) {
      return sendResponse(res, {
        statusCode: 401,
        success: false,
        message: 'You are not authorized! (Token missing)',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token as string, config.jwt_secret as string) as JwtPayload;
    } catch (error) {
      return sendResponse(res, {
        statusCode: 401,
        success: false,
        message: 'Invalid token or token expired!',
      });
    }

    const { id, role } = decoded;

    const user = await User.findById(id);

    if (!user) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: 'User not found!',
      });
    }

    if (requiredRoles.length > 0 && !requiredRoles.includes(role)) {
      return sendResponse(res, {
        statusCode: 403,
        success: false,
        message: 'You are forbidden to access this resource!',
      });
    }

    req.user = { id, role };
    next();
  });
};

export default auth;