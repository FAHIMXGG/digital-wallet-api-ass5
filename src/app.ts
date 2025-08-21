import express, { Application } from 'express';
import cors from 'cors';
import { AuthRoutes } from './modules/auth/auth.route';
import errorHandler from './middlewares/errorHandler.middleware';
import { UserRoutes } from './modules/user/user.route';
import { WalletRoutes } from './modules/wallet/wallet.route';
import { TransactionRoutes } from './modules/transaction/transaction.route';
import config from './config';
import cookieParser from 'cookie-parser';


const app: Application = express();
app.use(cookieParser());
app.use(express.json());
app.use(cors({
  origin: config.frontEndUrl,
  credentials: true,
}));


app.use('/api/v1/auth', AuthRoutes);
app.use('/api/v1/users', UserRoutes);
app.use('/api/v1/wallets', WalletRoutes);
app.use('/api/v1/transactions', TransactionRoutes);


app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Digital Wallet API is running!',
  });
});

app.use(errorHandler);

export default app;

