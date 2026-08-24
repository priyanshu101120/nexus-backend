import { workspaceRepository } from "../repositories/workspace.repository";
import { CreateWorkspaceInput } from "../validators/workspace.validator";
import { ApiError } from "./auth.service";

export const workspaceService = {
  async createWorkspace(input: CreateWorkspaceInput, ownerId: string) {
    const existingWorkspace = await workspaceRepository.findBySlug(input.slug);
    if (existingWorkspace) {
      throw new ApiError(409, "This workspace url is already taken ");
    }

    const workspace = await workspaceRepository.createWithOwner({
      name: input.name,
      slug: input.slug,
      ownerId,
    });
    return workspace;
  },

  async getMe(userId: string) {
    return await workspaceRepository.findWorspaceForUser(userId);
  },
  async getBySlug(slug: string, userId: string) {
    const workspace = await  workspaceRepository.findSlugForUser(slug, userId);
    if (!workspace) {
      throw new ApiError(404, "Workspace not found");
    }
    return workspace;
  },
};
