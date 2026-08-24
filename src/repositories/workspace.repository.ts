import { prisma } from "./../config/prisma";

export const workspaceRepository = {
  findBySlug(slug: string) {
    return prisma.workspace.findUnique({ where: { slug } });
  },

  createWithOwner(data: { name: string; slug: string; ownerId: string }) {
    return prisma.workspace.create({
      data: {
        name: data.name,
        slug: data.slug,
        members: {
          create: {
            userId: data.ownerId,
            role: "OWNER",
          },
        },
      },
      include: {
        members: true,
      },
    });
  },
  findWorspaceForUser(userId: string) {
    return prisma.workspace.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  findSlugForUser(slug: string, userId: string) {
    return prisma.workspace.findFirst({
      where: {
        slug,
        members: { some: { userId } },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true },
            },
          },
        },
      },
    });
  },
};
