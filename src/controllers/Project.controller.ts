import { Request, Response, NextFunction } from "express";
import { projectServices } from "../services/project.service";

export const projectController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = req.workspaceId!;
      const project = await projectServices.create(req.body, workspaceId);
      res
        .status(201)
        .json({ message: "Project created successfully", project });
    } catch (error) {
      next(error);
    }
  },
};
