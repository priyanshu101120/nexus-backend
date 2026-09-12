import { prisma } from "../config/prisma";

export const notificationRepository = {
  create(data: {
    userId: string;
    message: string;
    type: "INVITATION" | "GENERAL";
    invitationId?: string;
  }) {
    return prisma.notification.create({
      data,
    });
  },

  findByUser(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      include: {
        invitation: {
          include: {
            workspace: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            invitedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  markAsRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: {
        id,
        userId,
      },
      data: {
        read: true,
      },
    });
  },

  markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
      },
    });
  },
};