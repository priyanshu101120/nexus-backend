import bcrypt from "bcryptjs";
import { userRepository } from "../repositories/user.repository";
import { LoginInput, RegisterInput } from "../validators/auth.validator";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";

export class ApiError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

type SafeUser = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
};

function sanitizeUser(user: any): SafeUser {
  const { passwordHash, refreshToken, ...safeUser } = user;
  return safeUser;
}

export const authService = {
  async issueTokens(payload: { userId: string }) {
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    await userRepository.updateRefreshToken(payload.userId, refreshToken);
    return { accessToken, refreshToken };
  },

  async register(input: RegisterInput) {
    const exitingEmail = await userRepository.findByEmail(input.email);
    if (exitingEmail) {
      throw new ApiError(409, "Email already in use");
    }

    const hashPassword = await bcrypt.hash(input.password, 10);

    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash: hashPassword,
    });

    const tokens = await this.issueTokens({ userId: user.id });
    return { user: sanitizeUser(user), ...tokens };
  },

  async login(input: LoginInput) {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid email or password");
    }

    const tokens = await this.issueTokens({ userId: user.id });
    return { user: sanitizeUser(user), ...tokens };
  },

  async refresh(incomingToken: string) {
    let payload;
    try {
      payload = verifyRefreshToken(incomingToken);
    } catch {
      throw new ApiError(401, "Invalid or expired refresh token");
    }

    const user = await userRepository.findById(payload.userId);
    if (!user || (user as any).refreshToken !== incomingToken) {
      throw new ApiError(401, "Refresh token mismatch — please login again");
    }

    const tokens = await this.issueTokens({ userId: user.id });
    return { user: sanitizeUser(user), ...tokens };
  },

  async logout(userId: string) {
    await userRepository.updateRefreshToken(userId, null);
  },

  async getMe(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, "No user found");
    }
    return user;
  },
};