import { memberRepository } from "../repositories/member.repository";
import { ApiError } from "./auth.service";

export const memberService = {
  async list(workspaceId: string) {
    return memberRepository.findByWorkspace(workspaceId);
  },

  async updateRole(
    workspaceId: string,
    targetUserId: string,
    newRole: "ADMIN" | "MEMBER",
    actorUserId: string,
    actorRole: string
  ) {
    const target = await memberRepository.findOne(workspaceId, targetUserId);
    if (!target) {
      throw new ApiError(404, "Member not found in this workspace");
    }

    if (target.role === "OWNER") {
      throw new ApiError(403, "The workspace owner's role cannot be changed");
    }

    if (actorRole === "MEMBER") {
      throw new ApiError(403, "Members cannot change roles");
    }

    // ADMIN can only manage MEMBERs, and only ever set them to MEMBER (not promote to ADMIN)
    if (actorRole === "ADMIN") {
      if (target.role !== "MEMBER") {
        throw new ApiError(403, "Admins can only manage members, not other admins");
      }
      if (newRole !== "MEMBER") {
        throw new ApiError(403, "Only the owner can promote a member to admin");
      }
    }

    return memberRepository.updateRole(workspaceId, targetUserId, newRole);
  },

  async remove(
    workspaceId: string,
    targetUserId: string,
    actorUserId: string,
    actorRole: string
  ) {
    const target = await memberRepository.findOne(workspaceId, targetUserId);
    if (!target) {
      throw new ApiError(404, "Member not found in this workspace");
    }

    if (target.role === "OWNER") {
      throw new ApiError(403, "The workspace owner cannot be removed");
    }

    if (actorRole === "MEMBER") {
      throw new ApiError(403, "Members cannot remove other members");
    }

    if (actorRole === "ADMIN" && target.role !== "MEMBER") {
      throw new ApiError(403, "Admins can only remove members, not other admins");
    }

    await memberRepository.remove(workspaceId, targetUserId);
  },

  async leave(workspaceId: string, userId: string) {
    const membership = await memberRepository.findOne(workspaceId, userId);
    if (!membership) {
      throw new ApiError(404, "You are not a member of this workspace");
    }
    if (membership.role === "OWNER") {
      throw new ApiError(403, "The owner cannot leave the workspace — transfer ownership first");
    }
    await memberRepository.remove(workspaceId, userId);
  },
};