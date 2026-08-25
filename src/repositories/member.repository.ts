import { prisma } from "../config/prisma";

export const memberRepository = {
  findByWorkspace(workspaceId: string) {
    return prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
      orderBy: { joinedAt: "asc" },
    });
  },

  findOne(workspaceId: string, userId: string) {
    return prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
    });
  },

  create(workspaceId: string, userId: string, role: "ADMIN" | "MEMBER") {
    return prisma.workspaceMember.create({
      data: { workspaceId, userId, role },
    });
  },

  updateRole(workspaceId: string, userId: string, role: "ADMIN" | "MEMBER") {
    return prisma.workspaceMember.update({
      where: { userId_workspaceId: { userId, workspaceId } },
      data: { role },
    });
  },

  remove(workspaceId: string, userId: string) {
    return prisma.workspaceMember.delete({
      where: { userId_workspaceId: { userId, workspaceId } },
    });
  },
};