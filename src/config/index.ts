import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error(
    "JWT_SECRET is not defined in environment variables. Please check your .env file."
  );
}

const jwtExpiresIn: string = process.env.JWT_EXPIRES_IN || "7d";

export default {
  port: process.env.PORT || 5000,
  database_url: process.env.DATABASE_URL,
  jwt_secret: jwtSecret,
  jwt_expires_in: jwtExpiresIn,
  initial_wallet_balance: parseFloat(
    process.env.INITIAL_WALLET_BALANCE || "50"
  ),
};
