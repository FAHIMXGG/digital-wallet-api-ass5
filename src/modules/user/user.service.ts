import { User } from './user.model';

const getAllUsers = async (query: any) => {
  const users = await User.find(query).populate('wallet');
  return users;
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