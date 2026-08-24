import { taskRepository } from "../repositories/task.repository";
import {
  CreateTaskInput,
  MoveTaskInput,
  UpdateTaskInput,
} from "../validators/task.validator";
import { ApiError } from "./auth.service";

export const taskService = {
  async assertColumnBelongsToProject(columnId: string, projectId: string) {
    const column = await taskRepository.findColumnWithBoardProject(columnId);
    if (!column || column.board.projectId !== projectId) {
      throw new ApiError(400, "Column not found in this project");
    }
  },
  async assertTaskBelongsToProject(taskId: string, projectId: string) {
    const task = await taskRepository.findById(taskId);
    if (!task || task.column.board.project.id !== projectId) {
      throw new ApiError(400, "Task not found in this project");
    }
    return task;
  },
  async create(columnId: string, projectId: string, input: CreateTaskInput) {
    await this.assertColumnBelongsToProject(columnId, projectId);
    return taskRepository.create({ ...input, columnId });
  },
  async update(taskId: string, projectId: string, input: UpdateTaskInput) {
    await this.assertTaskBelongsToProject(taskId, projectId);
    return taskRepository.update(taskId, input);
  },

  async move(taskId: string, projectId: string, input: MoveTaskInput) {
    await this.assertTaskBelongsToProject(taskId, projectId);
    await this.assertColumnBelongsToProject(input.columnId, projectId);
    return taskRepository.move(taskId, input.columnId, input.order);
  },

  async remove(taskId: string, projectId: string) {
    await this.assertTaskBelongsToProject(taskId, projectId);
    await taskRepository.delete(taskId);
  },
};
