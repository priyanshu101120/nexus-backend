import { OAuth2Client } from "google-auth-library";
import bcrypt from "bcryptjs";
import { userRepository } from "../repositories/user.repository";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { RegisterInput, LoginInput } from "../validators/auth.validator";

export class ApiError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

function sanitizeUser(user: any) {
  const { passwordHash, refreshToken, googleId, ...safe } = user;
  return safe;
}

// process.env.GOOGLE_CLIENT_ID — same client ID used on the frontend
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const authService = {
  async issueTokens(userId: string) {
    const accessToken = signAccessToken({ userId });
    const refreshToken = signRefreshToken({ userId });
    await userRepository.updateRefreshToken(userId, refreshToken);
    return { accessToken, refreshToken };
  },

  async register(input: RegisterInput) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) throw new ApiError(409, "Email already registered");

    const hashedPassword = await bcrypt.hash(input.password, 10);
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash: hashedPassword,
    });

    const tokens = await this.issueTokens(user.id);
    return { user: sanitizeUser(user), ...tokens };
  },

  async login(input: LoginInput) {
    const user = await userRepository.findByEmail(input.email);
    if (!user || !user.passwordHash) {
      throw new ApiError(401, "Invalid email or password");
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) throw new ApiError(401, "Invalid email or password");

    const tokens = await this.issueTokens(user.id);
    return { user: sanitizeUser(user), ...tokens };
  },

  
  async googleLogin(idToken: string) {
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch {
      throw new ApiError(401, "Invalid Google token");
    }

    if (!payload?.email) {
      throw new ApiError(401, "Google account has no email");
    }

    const googleId = payload.sub;
    let user = await userRepository.findByGoogleId(googleId);

    if (!user) {
      
      const existingByEmail = await userRepository.findByEmail(payload.email);

      if (existingByEmail) {
        await userRepository.attachGoogleId(existingByEmail.id, googleId);
        user = existingByEmail;
      } else {
        user = await userRepository.createFromGoogle({
          name: payload.name || payload.email.split("@")[0],
          email: payload.email,
          googleId,
          avatarUrl: payload.picture,
        });
      }
    }

    const tokens = await this.issueTokens(user.id);
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

    const tokens = await this.issueTokens(user.id);
    return { user: sanitizeUser(user), ...tokens };
  },

  async logout(userId: string) {
    await userRepository.updateRefreshToken(userId, null);
  },

  async getMe(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new ApiError(404, "No user found");
    return user;
  },
};