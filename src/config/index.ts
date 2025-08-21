import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error(
    "JWT_SECRET is not defined in environment variables. Please check your .env file."
  );
}

//const jwtExpiresIn: string = process.env.JWT_EXPIRES_IN || "7d";

export default {
  port: process.env.PORT || 5000,
  frontEndUrl: process.env.FRONTENDURL,
  database_url: process.env.DATABASE_URL,
  jwt_secret: process.env.JWT_SECRET,
  jwt_expires_in: process.env.JWT_EXPIRES_IN,
  BCRYPT_SALT_ROUND: process.env.BCRYPT_SALT_ROUND,
  initial_wallet_balance: parseFloat(
    process.env.INITIAL_WALLET_BALANCE || "50"
  ),
  agent_commission_rate: parseFloat(process.env.AGENT_COMMISSION_RATE || '0.005'),
  daily_transaction_limit_amount: parseFloat(process.env.DAILY_TRANSACTION_LIMIT_AMOUNT || '10000'),
  daily_transaction_limit_count: parseInt(process.env.DAILY_TRANSACTION_LIMIT_COUNT || '5'),
  monthly_transaction_limit_amount: parseFloat(process.env.MONTHLY_TRANSACTION_LIMIT_AMOUNT || '50000'),
  monthly_transaction_limit_count: parseInt(process.env.MONTHLY_TRANSACTION_LIMIT_COUNT || '20'),

  // Email Configuration
  email_host: process.env.EMAIL_HOST,
  email_port: parseInt(process.env.EMAIL_PORT || '587'),
  email_user: process.env.EMAIL_USER,
  email_password: process.env.EMAIL_PASSWORD,
  email_from: process.env.EMAIL_FROM,

  // OTP Configuration
  otp_expires_in: parseInt(process.env.OTP_EXPIRES_IN || '300'), // 5 minutes in seconds
};
