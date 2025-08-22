import { Router } from 'express';
import { UserController } from './user.controller';
import auth from '../../middlewares/auth.middleware';

const router = Router();

router.get('/', auth('admin'), UserController.getAllUsers);
router.get('/search', auth('admin','user', 'agent'), UserController.searchUsers);
router.get('/me', auth('admin', 'user', 'agent'), UserController.getMe); 
router.get('/:id', auth('admin', 'user', 'agent'), UserController.getSingleUser)
router.patch('/approve-agent/:id', auth('admin'), UserController.approveAgent);
router.patch('/suspend-agent/:id', auth('admin'), UserController.suspendAgent);
router.patch('/update', auth('user', 'agent', 'admin'), UserController.updateMe);

export const UserRoutes = router;