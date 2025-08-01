import { User, IUser } from './user.model';


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

const getAllUsers = async (query: Record<string, unknown>): Promise<PaginatedResult<IUser>> => {

  const page = parseInt((query.page as string) || '1', 10);
  const limit = parseInt((query.limit as string) || '10', 10);
  const sortBy = (query.sortBy as string) || 'createdAt';
  const sortOrder = (query.sortOrder as string) === 'asc' ? 1 : -1;


  const filterQuery = { ...query };
  delete filterQuery.page;
  delete filterQuery.limit;
  delete filterQuery.sortBy;
  delete filterQuery.sortOrder;


  const currentPage = Math.max(1, page);
  const itemsPerPage = Math.min(Math.max(1, limit), 100);
  const skip = (currentPage - 1) * itemsPerPage;


  const sortObject: Record<string, 1 | -1> = {};
  sortObject[sortBy] = sortOrder;


  const totalItems = await User.countDocuments(filterQuery);
  const totalPages = Math.ceil(totalItems / itemsPerPage);


  const users = await User.find(filterQuery)
    .populate('wallet')
    .select('-password')
    .sort(sortObject)
    .skip(skip)
    .limit(itemsPerPage);

  return {
    data: users,
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

const getSingleUser = async (id: string) => {
  const user = await User.findById(id).populate('wallet');
  return user;
};


const approveAgent = async (agentId: string) => {
  const agent = await User.findById(agentId);
  if (!agent) {
    throw new Error('Agent not found.');
  }
  if (agent.role !== 'agent') {
    throw new Error('User is not an agent.');
  }
  if (agent.isApproved) {
    throw new Error('Agent is already approved.');
  }

  agent.isApproved = true;
  await agent.save();
  return agent;
};

const suspendAgent = async (agentId: string) => {
  const agent = await User.findById(agentId);
  if (!agent) {
    throw new Error('Agent not found.');
  }
  if (agent.role !== 'agent') {
    throw new Error('User is not an agent.');
  }
  if (!agent.isApproved) {
    throw new Error('Agent is already suspended (not approved).');
  }

  agent.isApproved = false;
  await agent.save();
  return agent;
};


export const UserService = {
  getAllUsers,
  getSingleUser,
  approveAgent, 
  suspendAgent  
};