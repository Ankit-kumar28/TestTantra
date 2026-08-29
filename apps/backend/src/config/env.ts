import "dotenv/config";

const PORT = Number(process.env.PORT) || 5000;

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

if (!JWT_ACCESS_SECRET) {
  throw new Error("JWT_ACCESS_SECRET is not configured");
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT,
  JWT_ACCESS_SECRET,
  JWT_ACCESS_EXPIRES_IN:
    process.env.JWT_ACCESS_EXPIRES_IN || "15m"
};