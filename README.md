# Digital Wallet API

A Node.js/Express API for digital wallet management with TypeScript, MongoDB, and JWT authentication.

## Features

- User authentication and authorization
- Wallet management
- Transaction processing
- Agent commission system
- Daily and monthly transaction limits

## Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update the environment variables in `.env` with your actual values

5. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment to Vercel

### Prerequisites
- Vercel account (sign up at https://vercel.com)
- Vercel CLI installed globally: `npm install -g vercel`

### Steps

1. **Build the project locally** (optional, to test):
   ```bash
   npm run build
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy to Vercel**:
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Choose your account
   - Link to existing project? **N** (for first deployment)
   - What's your project's name? **digital-wallet-api** (or your preferred name)
   - In which directory is your code located? **./** (current directory)

4. **Set Environment Variables** in Vercel Dashboard:
   - Go to your project in Vercel Dashboard
   - Navigate to Settings → Environment Variables
   - Add all the variables from your `.env.example` file:
     - `DATABASE_URL`
     - `JWT_SECRET`
     - `JWT_EXPIRES_IN`
     - `PORT` (Vercel will override this)
     - `INITIAL_WALLET_BALANCE`
     - `AGENT_COMMISSION_RATE`
     - `DAILY_TRANSACTION_LIMIT_AMOUNT`
     - `DAILY_TRANSACTION_LIMIT_COUNT`
     - `MONTHLY_TRANSACTION_LIMIT_AMOUNT`
     - `MONTHLY_TRANSACTION_LIMIT_COUNT`

5. **Redeploy** after setting environment variables:
   ```bash
   vercel --prod
   ```

### Important Notes

- Make sure your MongoDB database is accessible from the internet (use MongoDB Atlas for cloud hosting)
- The `JWT_SECRET` should be a strong, random string
- Vercel automatically handles the `PORT` environment variable
- Your API will be available at the URL provided by Vercel

## API Endpoints

- `GET /` - Health check
- `POST /api/v1/auth/*` - Authentication routes
- `GET/POST/PUT/DELETE /api/v1/users/*` - User management
- `GET/POST/PUT/DELETE /api/v1/wallets/*` - Wallet operations
- `GET/POST /api/v1/transactions/*` - Transaction management

## Environment Variables

See `.env.example` for all required environment variables and their descriptions.
