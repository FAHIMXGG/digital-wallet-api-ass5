import { Transaction, ITransaction } from './transaction.model';
import { Types } from 'mongoose';

interface PaginationQuery {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  role?: string;
}

interface PaginatedResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

const getMyTransactions = async (userId: string, query: PaginationQuery = {}): Promise<PaginatedResult<ITransaction>> => {
  
  const page = parseInt(query.page || '1', 10);
  const limit = parseInt(query.limit || '10', 10);
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
  const role = query.role as string;

  const currentPage = Math.max(1, page);
  const itemsPerPage = Math.min(Math.max(1, limit), 100);
  const skip = (currentPage - 1) * itemsPerPage;

  const sortObject: Record<string, 1 | -1> = {};
  sortObject[sortBy] = sortOrder;

  const userObjectId = new Types.ObjectId(userId);

  const pipeline: any[] = [
    {
      $match: {
        $or: [{ sender: userObjectId }, { receiver: userObjectId }]
      }
    },

    {
      $lookup: {
        from: 'users',
        localField: 'sender',
        foreignField: '_id',
        as: 'senderData'
      }
    },

    {
      $lookup: {
        from: 'users',
        localField: 'receiver',
        foreignField: '_id',
        as: 'receiverData'
      }
    },

    ...(role ? [{
      $match: {
        $or: [
          {
            $and: [
              { sender: { $eq: userObjectId } },
              { 'receiverData.role': role }
            ]
          },
          {
            $and: [
              { receiver: { $eq: userObjectId } },
              { 'senderData.role': role }
            ]
          }
        ]
      }
    }] : []),

    {
      $project: {
        sender: {
          $cond: {
            if: { $gt: [{ $size: '$senderData' }, 0] },
            then: {
              _id: { $arrayElemAt: ['$senderData._id', 0] },
              name: { $arrayElemAt: ['$senderData.name', 0] },
              email: { $arrayElemAt: ['$senderData.email', 0] }
            },
            else: null
          }
        },
        receiver: {
          $cond: {
            if: { $gt: [{ $size: '$receiverData' }, 0] },
            then: {
              _id: { $arrayElemAt: ['$receiverData._id', 0] },
              name: { $arrayElemAt: ['$receiverData.name', 0] },
              email: { $arrayElemAt: ['$receiverData.email', 0] }
            },
            else: null
          }
        },
        amount: 1,
        type: 1,
        status: 1,
        fee: 1,
        commission: 1,
        description: 1,
        createdAt: 1,
        updatedAt: 1
      }
    }
  ];

  const countPipeline = [...pipeline, { $count: 'total' }];
  const countResult = await Transaction.aggregate(countPipeline);
  const totalItems = countResult.length > 0 ? countResult[0].total : 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  pipeline.push(
    { $sort: sortObject },
    { $skip: skip },
    { $limit: itemsPerPage }
  );

  const transactions = await Transaction.aggregate(pipeline);

  return {
    data: transactions,
    pagination: {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    },
  };
};

const getAllTransactions = async (query: Record<string, unknown>): Promise<PaginatedResult<ITransaction>> => {
  const page = parseInt((query.page as string) || '1', 10);
  const limit = parseInt((query.limit as string) || '10', 10);
  const sortBy = (query.sortBy as string) || 'createdAt';
  const sortOrder = (query.sortOrder as string) === 'asc' ? 1 : -1;
  const role = query.role as string;

  const filterQuery = { ...query };
  delete filterQuery.page;
  delete filterQuery.limit;
  delete filterQuery.sortBy;
  delete filterQuery.sortOrder;
  delete filterQuery.role;

  const currentPage = Math.max(1, page);
  const itemsPerPage = Math.min(Math.max(1, limit), 100);
  const skip = (currentPage - 1) * itemsPerPage;

  const sortObject: Record<string, 1 | -1> = {};
  sortObject[sortBy] = sortOrder;

  const pipeline: any[] = [
    ...(Object.keys(filterQuery).length > 0 ? [{ $match: filterQuery }] : []),

    {
      $lookup: {
        from: 'users',
        localField: 'sender',
        foreignField: '_id',
        as: 'senderData'
      }
    },

    {
      $lookup: {
        from: 'users',
        localField: 'receiver',
        foreignField: '_id',
        as: 'receiverData'
      }
    },

    ...(role ? [{
      $match: {
        $or: [
          { 'senderData.role': role },
          { 'receiverData.role': role }
        ]
      }
    }] : []),

    {
      $project: {
        sender: {
          $cond: {
            if: { $gt: [{ $size: '$senderData' }, 0] },
            then: {
              _id: { $arrayElemAt: ['$senderData._id', 0] },
              name: { $arrayElemAt: ['$senderData.name', 0] },
              email: { $arrayElemAt: ['$senderData.email', 0] }
            },
            else: null
          }
        },
        receiver: {
          $cond: {
            if: { $gt: [{ $size: '$receiverData' }, 0] },
            then: {
              _id: { $arrayElemAt: ['$receiverData._id', 0] },
              name: { $arrayElemAt: ['$receiverData.name', 0] },
              email: { $arrayElemAt: ['$receiverData.email', 0] }
            },
            else: null
          }
        },
        amount: 1,
        type: 1,
        status: 1,
        fee: 1,
        commission: 1,
        description: 1,
        createdAt: 1,
        updatedAt: 1
      }
    }
  ];

  const countPipeline = [...pipeline, { $count: 'total' }];
  const countResult = await Transaction.aggregate(countPipeline);
  const totalItems = countResult.length > 0 ? countResult[0].total : 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  pipeline.push(
    { $sort: sortObject },
    { $skip: skip },
    { $limit: itemsPerPage }
  );

  const transactions = await Transaction.aggregate(pipeline);

  return {
    data: transactions,
    pagination: {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    },
  };
};

export const TransactionService = {
  getMyTransactions,
  getAllTransactions,
};