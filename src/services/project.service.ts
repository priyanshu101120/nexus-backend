import { projectRepository } from "../repositories/project.repository";
import { CreateProjectInput } from "../validators/project.validater";
import { ApiError } from "./auth.service";

export const projectServices = {
  async create(input: CreateProjectInput, workspaceId: string) {
    return projectRepository.createWithBoard({ ...input, workspaceId });
  },

  async list(workspaceId: string) {
    return projectRepository.findByWorkspace(workspaceId);
  },

  async getById(projectId: string, workspaceId: string) {
    const project = await projectRepository.findByIdInWorkspace(
      projectId,
      workspaceId,
    );
    if (!project) {
      throw new ApiError(404, "Project not found");
    }
    return project;
  },
};
