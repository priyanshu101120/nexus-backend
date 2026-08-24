import { prisma } from "../config/prisma";

const DEFAULT_COLUMNS = ["TODO", "IN PROGRESS", "DONE"];

export const projectRepository = {
  // Creates Project -> Board -> 3 default Columns, all atomically.
  createWithBoard(data: {
    workspaceId: string;
    name: string;
    description?: string;
    color?: string;
    startDate?: string;
    dueDate?: string;
  }) {
    return prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        color: data.color,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        workspaceId: data.workspaceId,
        board: {
          create: {
            columns: {
              create: DEFAULT_COLUMNS.map((name, index) => ({
                name,
                order: index,
              })),
            },
          },
        },
      },
      include: {
        board: {
          include: { columns: true },
        },
      },
    });
  },

  findByWorkspace(workspaceId: string) {
    return prisma.project.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
    });
  },

  findByIdInWorkspace(projectId: string, workspaceId: string) {
    return prisma.project.findFirst({
      where: { id: projectId, workspaceId },
      include: {
        board: {
          include: {
            columns: {
              orderBy: { order: "asc" },
              include: {
                tasks: {
                  orderBy: { order: "asc" },
                  include: {
                    assignee: {
                      select: { id: true, name: true, avatarUrl: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  },
};
