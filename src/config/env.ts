import "dotenv/config";

function getEnvVariable(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Environment variable not found: ${key}`);
  }

  return value;
}

export const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",

  DATABASE_URL: getEnvVariable("DATABASE_URL"),

  JWT_ACCESS_SECRET: getEnvVariable("JWT_ACCESS_SECRET"),
  JWT_REFRESH_SECRET: getEnvVariable("JWT_REFRESH_SECRET"),

  JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY || "1d",
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || "7d",

  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
};