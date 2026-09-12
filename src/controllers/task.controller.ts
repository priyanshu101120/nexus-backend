import { Request, Response, NextFunction } from "express";
import { taskService } from "../services/task.service";

export const taskController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId, columnId } = req.params;
      const task = await taskService.create(columnId, projectId, req.body);
      res.status(201).json({ message: "Task created successfully", task });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId, taskId } = req.params;
      const task = await taskService.update(taskId, projectId, req.body);
      res.status(200).json({ message: "Task updated successfully", task });
    } catch (error) {
      next(error);
    }
  },

  async move(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId, taskId } = req.params;
      const task = await taskService.move(taskId, projectId, req.body);
      res.status(200).json({ message: "Task moved successfully", task });
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId, taskId } = req.params;
      await taskService.remove(taskId, projectId);
      res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
      next(error);
    }
  },

  // NEW: GET /workspace/:slug/tasks — all tasks across every project
  async listByWorkspace(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = req.workspaceId!;
      const tasks = await taskService.listByWorkspace(workspaceId);
      res.status(200).json({ tasks });
    } catch (error) {
      next(error);
    }
  },

  async getByIdInWorkspace(req: Request, res: Response) {
  const { slug, taskId } = req.params;

  const task = await taskService.getByIdInWorkspace(
    slug,
    taskId
  );

  res.status(200).json({
    task,
  });
}
};