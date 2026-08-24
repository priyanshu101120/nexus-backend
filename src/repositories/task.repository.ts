import { prisma } from "../config/prisma";

export const taskRepository = {
  async findMaxOrderInColumn(columnId: string) {
    const lastTask = await prisma.task.findFirst({
      where: { columnId },
      orderBy: { order: "desc" },
    });
    return lastTask ? lastTask.order + 1 : 0;
  },

  async create(data: {
    columnId: string;
    title: string;
    description?: string;
    priority?: "LOW" | "MEDIUM" | "HIGH";
    dueDate?: string;
    assigneeId?: string;
  }) {
    const order = await this.findMaxOrderInColumn(data.columnId);

    return prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        assigneeId: data.assigneeId,
        columnId: data.columnId,
        order,
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });
  },

  async findById(taskId: string) {
    return prisma.task.findUnique({
      where: { id: taskId },
      include: {
        column: { include: { board: { include: { project: true } } } },
      },
    });
  },
  async update(taskId: string, data: Record<string, any>) {
    return prisma.task.update({
      where: { id: taskId },
      data,
      include: {
        assignee: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
  },
  move(taskId: string, columnId: string, order: number) {
    return prisma.task.update({
      where: { id: taskId },
      data: { columnId, order },
      include: {
        assignee: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
  },

  delete(taskId: string) {
    return prisma.task.delete({ where: { id: taskId } });
  },

  findColumnWithBoardProject(columnId: string) {
    return prisma.column.findUnique({
      where: { id: columnId },
      include: { board: { include: { project: true } } },
    });
  },
};
