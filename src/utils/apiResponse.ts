import { Response } from 'express';

interface ApiResponseData {
  statusCode: number;
  success: boolean;
  message: string;
  data?: any;
}

const sendResponse = (res: Response, data: ApiResponseData) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
  });
};

export default sendResponse;