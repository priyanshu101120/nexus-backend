import { prisma } from "../config/prisma";

export const invitationRepository = {
  findPendingByEmailInWorkspace(email: string, workspaceId: string) {
    return prisma?.invitation.findFirst({
      where: { email, workspaceId, accepted: false },
    });
  },
  create(data: {
    email: string;
    role: "ADMIN" | "MEMBER";
    workspaceId: string;
    invitedById: string;
    token: string;
  }) {
    return prisma.invitation.create({ data });
  },

  findPendingByWorkspace(workspaceId: string) {
    return prisma.invitation.findMany({
      where: { workspaceId, accepted: false },
      include: { invitedBy: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
  },
  findByToken(token: string) {
    return prisma.invitation.findUnique({
      where: { token },
      include: { workspace: true },
    });
  },
  markAccepted(id: string) {
    return prisma.invitation.update({
      where: { id },
      data: { accepted: true },
    });
  },
};
