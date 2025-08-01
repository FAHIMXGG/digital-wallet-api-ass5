import { Router } from 'express';
import { WalletController } from './wallet.controller';
import auth from '../../middlewares/auth.middleware';

const router = Router();

router.get('/', auth('admin'), WalletController.getAllWallets);
router.get('/my-wallet', auth('user', 'agent', 'admin'), WalletController.getMyWallet);
router.patch('/block/:walletId', auth('admin'), WalletController.blockUnblockWallet);
router.post('/add-money', auth('user', 'agent'), WalletController.addMoney);
router.post('/withdraw', auth('user'), WalletController.withdrawMoney);
router.post('/send-money', auth('user'), WalletController.sendMoney);
router.post('/cash-out', auth('agent'), WalletController.cashOut);

export const WalletRoutes = router;