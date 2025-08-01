# Live Server Url: https://digital-wallet-api-ass5.vercel.app/

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

## Environment Variables

See `.env.example` for all required environment variables and their descriptions.

## API Documentation

### Base URL
```
http://localhost:3000
```

### Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization:<your-jwt-token>
```

---

## API Endpoints

### 🔐 Authentication & Setup

#### 1.1 Register a Regular User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
    "name": "user0",
    "email": "user0@example.com",
    "password": "password123",
    "role": "user",
    "phone": "01758000000" 
}
```

**Response:**
```json
{
    "success": true,
    "message": "User registered successfully!",
    "data": {
        "name": "user0",
        "email": "user0@example.com",
        "phone": "01758000000",
        "role": "user",
        "_id": "688c84ede1a80a2b9ab1f659",
        "isApproved": true,
        "createdAt": "2025-08-01T09:12:13.762Z",
        "updatedAt": "2025-08-01T09:12:13.913Z",
        "__v": 0,
        "wallet": "688c84ede1a80a2b9ab1f65b"
    }
}
```

> 📝 **Action:** Copy the `_id` from the response. This is your `<USER1_ID>`.

#### 1.2 Register an Agent
```http
POST /api/v1/auth/register
Content-Type: application/json

{
    "name": "Agent Alpha",
    "email": "agent.alpha@example.com",
    "password": "agentpass",
    "role": "agent"
}
```

> 📝 **Action:** Copy the `_id` from the response. This is your `<AGENT_ID>`.

#### 1.3 Login (Admin, User, Agent)
```http
POST /api/v1/auth/login
Content-Type: application/json
```

**Admin Login:**
```json
{
    "email": "admin@example.com",
    "password": "adminpassword"
}
```

**User Login:**
```json
{
    "email": "user1@example.com",
    "password": "password123"
}
```

**Agent Login:**
```json
{
    "email": "agent.alpha@example.com",
    "password": "agentpass"
}
```

> ⚠️ **Note:** Agent login will fail until the agent is approved by an admin.

> 📝 **Action:** For each successful login, copy the `token` from the response.

---

### 👑 Admin Functionalities

> 🔑 **Required:** Admin JWT Token in Authorization header

#### 2.1 View All Users & Agents
```http
GET /api/v1/users
Authorization:<admin_token>
```

> 📝 **Action:** Use this to get the IDs of all users, agents, and their wallets.

#### 2.2 View All Transactions
```http
GET /api/v1/transactions
Authorization:<admin_token>
```

> 📝 **Action:** See a list of all transactions across the system.

#### 2.3 Approve an Agent
```http
PATCH /api/v1/users/approve-agent/<AGENT_ID>
Authorization:<admin_token>
Content-Type: application/json

{}
```

> ⚠️ **Critical:** This step is required to enable agent login and operations.

#### 2.4 Suspend an Agent
```http
PATCH /api/v1/users/suspend-agent/<AGENT_ID>
Authorization:<admin_token>
Content-Type: application/json

{}
```

#### 2.5 Block/Unblock a User Wallet
```http
PATCH /api/v1/wallets/block/<USER_WALLET_ID>
Authorization:<admin_token>
Content-Type: application/json

{
    "isBlocked": true
}
```

> 📝 **Action:** Prevents the user from making transactions. Get the `<USER_WALLET_ID>` from a `GET /users` request.

---

### 👤 User Functionalities

> 🔑 **Required:** User JWT Token in Authorization header

#### 3.1 Add Money (Top-up)
```http
POST /api/v1/wallets/add-money
Authorization:<user_token>
Content-Type: application/json

{
    "amount": 5000
}
```

**Response:**
```json
{
    "success": true,
    "message": "Money added successfully!",
    "data": {
        "_id": "688a4d730aa0b48251eb30a3",
        "userId": "688a4d720aa0b48251eb30a1",
        "balance": 21950,
        "isBlocked": false,
        "dailySpentAmount": 6100,
        "dailyTransactionCount": 3,
        "monthlySpentAmount": 6100,
        "monthlyTransactionCount": 3,
        "lastDailyReset": "2025-08-01T09:19:22.856Z",
        "lastMonthlyReset": "2025-08-01T09:19:22.856Z",
        "createdAt": "2025-07-30T16:50:59.104Z",
        "updatedAt": "2025-08-01T09:20:13.451Z",
        "__v": 0
    }
}
```

> 📝 **Action:** Add funds to the user's own wallet.

#### 3.2 Withdraw Money
```http
POST /api/v1/wallets/withdraw
Authorization:<user_token>
Content-Type: application/json

{
    "amount": 1000
}
```

> 📝 **Action:** Withdraws funds from the user's wallet.

#### 3.3 Send Money
```http
POST /api/v1/wallets/send-money
Authorization:<user_token>
Content-Type: application/json

{
    "receiverId": "<ANOTHER_USER_ID>",
    "amount": 500
}
```

> 📝 **Action:** Sends money to another user.

#### 3.4 View My Transaction History
```http
GET /api/v1/transactions/my-history
Authorization:<user_token>
```

**Response:**
```json
[
    {
            "_id": "688ba1fa2e052dccb2805e8a",
            "sender": "688a4d720aa0b48251eb30a1",
            "amount": 5000,
            "type": "add_money",
            "status": "completed",
            "fee": 0,
            "commission": 0,
            "description": "Money added to wallet by user",
            "createdAt": "2025-07-31T17:03:54.891Z",
            "updatedAt": "2025-07-31T17:03:54.891Z",
            "__v": 0
        }
]
```

> 📝 **Action:** See all transactions where the user was the sender or receiver.

---

### 🏢 Agent Functionalities

> 🔑 **Required:** Approved Agent JWT Token in Authorization header

#### 4.1 Add Money to User (Cash-in)
```http
POST /api/v1/wallets/add-money
Authorization:<agent_token>
Content-Type: application/json

{
    "userId": "<USER_ID>",
    "amount": 1500
}
```

**Response:**
```json
{
    "success": true,
    "message": "Cash-in successful! Agent received commission.",
    "data": {
        "userWallet": {
            "_id": "688a4dc597ad660d4909008f",
            "userId": "688a4dc497ad660d4909008d",
            "balance": 2048,
            "isBlocked": false,
            "dailySpentAmount": 0,
            "dailyTransactionCount": 0,
            "monthlySpentAmount": 0,
            "monthlyTransactionCount": 0,
            "lastDailyReset": "2025-07-30T16:52:21.057Z",
            "lastMonthlyReset": "2025-07-30T16:52:21.057Z",
            "createdAt": "2025-07-30T16:52:21.058Z",
            "updatedAt": "2025-08-01T09:20:08.994Z",
            "__v": 0
        },
        "agentWallet": {
            "_id": "688a5087b5aa9c4283885ed5",
            "userId": "688a5087b5aa9c4283885ed3",
            "balance": 109.99000000000001,
            "isBlocked": false,
            "dailySpentAmount": 0,
            "dailyTransactionCount": 0,
            "monthlySpentAmount": 0,
            "monthlyTransactionCount": 0,
            "lastDailyReset": "2025-07-30T17:04:07.604Z",
            "lastMonthlyReset": "2025-07-30T17:04:07.604Z",
            "createdAt": "2025-07-30T17:04:07.604Z",
            "updatedAt": "2025-08-01T09:20:08.999Z",
            "__v": 0
        }
    }
}
```

> 📝 **Action:** The agent adds funds to the specified user's wallet.

#### 4.2 Withdraw Money from User (Cash-out)
```http
POST /api/v1/wallets/cash-out
Authorization:<agent_token>
Content-Type: application/json

{
    "userId": "<USER_ID>",
    "amount": 250
}
```

**Response:**
```json
{
    "success": true,
    "message": "Cash-out successful! Agent received commission.",
    "data": {
        "userWallet": {
            "_id": "688a4d730aa0b48251eb30a3",
            "userId": "688a4d720aa0b48251eb30a1",
            "balance": 18050,
            "isBlocked": false,
            "dailySpentAmount": 5000,
            "dailyTransactionCount": 1,
            "monthlySpentAmount": 5000,
            "monthlyTransactionCount": 1,
            "lastDailyReset": "2025-08-01T09:19:22.856Z",
            "lastMonthlyReset": "2025-08-01T09:19:22.856Z",
            "createdAt": "2025-07-30T16:50:59.104Z",
            "updatedAt": "2025-08-01T09:19:22.857Z",
            "__v": 0
        },
        "agentWallet": {
            "_id": "688a5087b5aa9c4283885ed5",
            "userId": "688a5087b5aa9c4283885ed3",
            "balance": 104.995,
            "isBlocked": false,
            "dailySpentAmount": 0,
            "dailyTransactionCount": 0,
            "monthlySpentAmount": 0,
            "monthlyTransactionCount": 0,
            "lastDailyReset": "2025-07-30T17:04:07.604Z",
            "lastMonthlyReset": "2025-07-30T17:04:07.604Z",
            "createdAt": "2025-07-30T17:04:07.604Z",
            "updatedAt": "2025-08-01T09:19:22.873Z",
            "__v": 0
        }
    }
}
```

> 📝 **Action:** The agent withdraws funds from the specified user's wallet. The agent receives a commission.

#### 4.3 View My Commission History
```http
GET /api/v1/transactions/my-history
Authorization:<agent_token>
```

**Response:**
```json
[
    {
    "success": true,
    "message": "Transaction history fetched successfully!",
    "data": [
        {
            "_id": "688b12e4e964f81c90bb8aa2",
            "sender": "688a5087b5aa9c4283885ed3",
            "receiver": "688a4d720aa0b48251eb30a1",
            "amount": 5000,
            "type": "cash_out",
            "status": "completed",
            "fee": 0,
            "commission": 25,
            "description": "Cash-out of 5000 for user 688a4d720aa0b48251eb30a1 by agent 688a5087b5aa9c4283885ed3. Agent commission: 25.00",
            "createdAt": "2025-07-31T06:53:24.108Z",
            "updatedAt": "2025-07-31T06:53:24.108Z",
            "__v": 0
        },
        {
            "_id": "688b0ec8e964f81c90bb8a89",
            "sender": "688a5087b5aa9c4283885ed3",
            "receiver": "688a4dc497ad660d4909008d",
            "amount": 999,
            "type": "cash_in",
            "status": "completed",
            "fee": 0,
            "commission": 4.995,
            "description": "Cash-in of 999 for user 688a4dc497ad660d4909008d by agent 688a5087b5aa9c4283885ed3. Agent commission: 5.00",
            "createdAt": "2025-07-31T06:35:52.033Z",
            "updatedAt": "2025-07-31T06:35:52.033Z",
            "__v": 0
        }
    ]
}
]
```

> 📝 **Action:** See all transactions initiated by the agent, including the commission field.

---

### 🧪 Testing & Features

#### 5.1 Test Daily/Monthly Limits

**Prerequisites:**
- Ensure your `.env` has a low limit for testing:
  ```env
  DAILY_TRANSACTION_LIMIT_COUNT=3
  ```

**Test Steps:**
1. Make 3 successful transactions:
   ```http
   POST /api/v1/wallets/withdraw
   Authorization:<user_token>
   Content-Type: application/json

   {
       "amount": 100
   }
   ```

2. On the 4th attempt, you should receive:
   ```json
   {
       "error": "Daily transaction count limit exceeded"
   }
   ```

#### 5.2 Test Notification System

**Action:** Perform any successful transaction from the above endpoints.

**Confirmation:** Check your server terminal. You should see detailed transaction notification logs after every successful operation.

---

### 📊 Quick Reference

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/v1/auth/register` | POST | ❌ | Register new user/agent |
| `/api/v1/auth/login` | POST | ❌ | Login and get JWT token |
| `/api/v1/users` | GET | Admin | View all users and agents |
| `/api/v1/users/approve-agent/:id` | PATCH | Admin | Approve an agent |
| `/api/v1/users/suspend-agent/:id` | PATCH | Admin | Suspend an agent |
| `/api/v1/wallets` | GET | Admin | View all wallets (with role filter) |
| `/api/v1/wallets/my-wallet` | GET | User/Agent/admin | My wallet |
| `/api/v1/wallets/block/:id` | PATCH | Admin | Block a user wallet |
| `/api/v1/wallets/add-money` | POST | User/Agent | Add money to wallet |
| `/api/v1/wallets/withdraw` | POST | User | Withdraw money |
| `/api/v1/wallets/send-money` | POST | User | Send money to another user |
| `/api/v1/wallets/cash-out` | POST | Agent | Cash-out from user wallet |
| `/api/v1/transactions/my-history` | GET | User/Agent | View transaction history |
| `/api/v1/transactions` | GET | Admin | View all transactions |


### 📊 Query Parameters:

`/api/v1/users?limit=10`
`/api/v1/users?role=agent`
`/api/v1/wallets?limit=3`
`/api/v1/wallets?role=user&limit=3`
`/api/v1/transactions/my-history?limit=10`
`/api/v1/transactions?role=user&limit=3`
`/my-history?role=agent&limit=1`



## Additional Documentation

📋 **[API Validation Examples](validation-examples.md)** - Detailed examples of validation error responses and success formats for all API endpoints.