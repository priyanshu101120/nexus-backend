import { prisma } from "../config/prisma";

export const userRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        refreshToken: true,
        passwordHash: true,
      },
    });
  },

  create(data: { name: string; email: string; passwordHash: string }) {
    return prisma.user.create({
      data,
      select: { id: true, name: true, email: true, createdAt: true },
    });
  },

  findByGoogleId(googleId: string) {
    return prisma.user.findUnique({ where: { googleId } });
  },

  
  createFromGoogle(data: {
    name: string;
    email: string;
    googleId: string;
    avatarUrl?: string;
  }) {
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        googleId: data.googleId,
        avatarUrl: data.avatarUrl,
      },
    });
  },


  attachGoogleId(userId: string, googleId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { googleId },
    });
  },

  updateRefreshToken(id: string, refreshToken: string | null) {
    return prisma.user.update({ where: { id }, data: { refreshToken } });
  },

  updatePassword(id: string, hashPassword: string) {
    return prisma.user.update({
      where: { id },
      data: { passwordHash: hashPassword },
    });
  },
};
