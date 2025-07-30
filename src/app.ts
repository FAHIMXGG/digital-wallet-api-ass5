import express, { Application } from 'express';
import cors from 'cors';
import { AuthRoutes } from './modules/auth/auth.route';
import errorHandler from './middlewares/errorHandler.middleware';
import { UserRoutes } from './modules/user/user.route';


console.log('--- app.ts: Module loaded ---');

const app: Application = express();

app.use(express.json());
app.use(cors());

app.use('/api/v1/auth', AuthRoutes);
app.use('/api/v1/users', UserRoutes);


app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Digital Wallet API is running!',
  });
});

app.use(errorHandler);

export default app;