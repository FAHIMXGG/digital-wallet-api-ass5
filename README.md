# Server Url: https://digital-wallet-api-ass5.vercel.app/

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
POST /auth/register
Content-Type: application/json

{
    "name": "User One",
    "email": "user1@example.com",
    "password": "password123",
    "role": "user"
}
```

**Response:**
```json
{
    "_id": "user_id_here",
    "name": "User One",
    "email": "user1@example.com",
    "role": "user",
    "token": "jwt_token_here"
}
```

> 📝 **Action:** Copy the `_id` from the response. This is your `<USER1_ID>`.

#### 1.2 Register an Agent
```http
POST /auth/register
Content-Type: application/json

{
    "name": "Agent Alpha",
    "email": "agent.alpha@example.com",
    "password": "agentpass",
    "role": "agent"
}
```

**Response:**
```json
{
    "_id": "agent_id_here",
    "name": "Agent Alpha",
    "email": "agent.alpha@example.com",
    "role": "agent",
    "token": "jwt_token_here"
}
```

> 📝 **Action:** Copy the `_id` from the response. This is your `<AGENT_ID>`.

#### 1.3 Login (Admin, User, Agent)
```http
POST /auth/login
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
GET /users
Authorization:<admin_token>
```

**Response:**
```json
[
    {
        "_id": "user_id",
        "name": "User One",
        "email": "user1@example.com",
        "role": "user",
        "wallet": {
            "_id": "wallet_id",
            "balance": 1000
        }
    }
]
```

> 📝 **Action:** Use this to get the IDs of all users, agents, and their wallets.

#### 2.2 View All Transactions
```http
GET /transactions
Authorization:<admin_token>
```

> 📝 **Action:** See a list of all transactions across the system.

#### 2.3 Approve an Agent
```http
PATCH /users/approve-agent/<AGENT_ID>
Authorization:<admin_token>
Content-Type: application/json

{}
```

> ⚠️ **Critical:** This step is required to enable agent login and operations.

#### 2.4 Suspend an Agent
```http
PATCH /users/suspend-agent/<AGENT_ID>
Authorization:<admin_token>
Content-Type: application/json

{}
```

#### 2.5 Block a User Wallet
```http
PATCH /wallets/block/<USER_WALLET_ID>
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
POST /wallets/add-money
Authorization:<user_token>
Content-Type: application/json

{
    "amount": 5000
}
```

**Response:**
```json
{
    "message": "Money added successfully",
    "wallet": {
        "_id": "wallet_id",
        "balance": 6000,
        "userId": "user_id"
    },
    "transaction": {
        "_id": "transaction_id",
        "type": "add_money",
        "amount": 5000
    }
}
```

> 📝 **Action:** Add funds to the user's own wallet.

#### 3.2 Withdraw Money
```http
POST /wallets/withdraw
Authorization:<user_token>
Content-Type: application/json

{
    "amount": 1000
}
```

> 📝 **Action:** Withdraws funds from the user's wallet.

#### 3.3 Send Money
```http
POST /wallets/send-money
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
GET /transactions/my-history
Authorization:<user_token>
```

**Response:**
```json
[
    {
        "_id": "transaction_id",
        "type": "send_money",
        "amount": 500,
        "senderId": "user_id",
        "receiverId": "another_user_id",
        "createdAt": "2024-01-01T00:00:00.000Z"
    }
]
```

> 📝 **Action:** See all transactions where the user was the sender or receiver.

---

### 🏢 Agent Functionalities

> 🔑 **Required:** Approved Agent JWT Token in Authorization header

#### 4.1 Add Money to User (Cash-in)
```http
POST /wallets/add-money
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
    "message": "Money added successfully",
    "wallet": {
        "_id": "wallet_id",
        "balance": 2500,
        "userId": "user_id"
    },
    "transaction": {
        "_id": "transaction_id",
        "type": "add_money",
        "amount": 1500,
        "agentId": "agent_id"
    }
}
```

> 📝 **Action:** The agent adds funds to the specified user's wallet.

#### 4.2 Withdraw Money from User (Cash-out)
```http
POST /wallets/cash-out
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
    "message": "Cash-out successful",
    "wallet": {
        "_id": "wallet_id",
        "balance": 2250,
        "userId": "user_id"
    },
    "transaction": {
        "_id": "transaction_id",
        "type": "cash_out",
        "amount": 250,
        "agentId": "agent_id",
        "commission": 12.5
    }
}
```

> 📝 **Action:** The agent withdraws funds from the specified user's wallet. The agent receives a commission.

#### 4.3 View My Commission History
```http
GET /transactions/my-history
Authorization:<agent_token>
```

**Response:**
```json
[
    {
        "_id": "transaction_id",
        "type": "cash_out",
        "amount": 250,
        "agentId": "agent_id",
        "commission": 12.5,
        "createdAt": "2024-01-01T00:00:00.000Z"
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
   POST /wallets/withdraw
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
| `/auth/register` | POST | ❌ | Register new user/agent |
| `/auth/login` | POST | ❌ | Login and get JWT token |
| `/users` | GET | Admin | View all users and agents |
| `/transactions` | GET | Admin | View all transactions |
| `/users/approve-agent/:id` | PATCH | Admin | Approve an agent |
| `/users/suspend-agent/:id` | PATCH | Admin | Suspend an agent |
| `/wallets/block/:id` | PATCH | Admin | Block a user wallet |
| `/wallets/add-money` | POST | User/Agent | Add money to wallet |
| `/wallets/withdraw` | POST | User | Withdraw money |
| `/wallets/send-money` | POST | User | Send money to another user |
| `/wallets/cash-out` | POST | Agent | Cash-out from user wallet |
| `/transactions/my-history` | GET | User/Agent | View transaction history |
