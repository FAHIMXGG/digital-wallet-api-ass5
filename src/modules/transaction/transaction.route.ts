import { Router } from 'express';
import { TransactionController } from './transaction.controller';
import auth from '../../middlewares/auth.middleware';

const router = Router();

router.get('/my-history', auth('user', 'agent'), TransactionController.getMyTransactions);
router.get('/', auth('admin'), TransactionController.getAllTransactions);

export const TransactionRoutes = router;