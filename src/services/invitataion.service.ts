import crypto from "crypto";
import { invitationRepository } from "../repositories/invitation.repository";
import { memberRepository } from "../repositories/member.repository";
import { userRepository } from "../repositories/user.repository";
import { CreateInvitationInput } from "../validators/invitation.validator";
import { ApiError } from "./auth.service";

function canInvite(actorRole: string) {
  return actorRole === "OWNER" || actorRole === "ADMIN";
}

export const invitationService = {
  async create(input: CreateInvitationInput, workspaceId: string, invitedById: string, actorRole: string) {
    if (!canInvite(actorRole)) {
      throw new ApiError(403, "Only owners and admins can invite members");
    }

    // Only an OWNER can hand out the ADMIN role; an ADMIN can only invite as MEMBER
    if (input.role === "ADMIN" && actorRole !== "OWNER") {
      throw new ApiError(403, "Only the workspace owner can invite someone as ADMIN");
    }

    const existingUser = await userRepository.findByEmail(input.email);
    if (existingUser) {
      const existingMembership = await memberRepository.findOne(workspaceId, existingUser.id);
      if (existingMembership) {
        throw new ApiError(409, "This user is already a member of the workspace");
      }
    }

    const pendingInvite = await invitationRepository.findPendingByEmailInWorkspace(input.email, workspaceId);
    if (pendingInvite) {
      throw new ApiError(409, "An invitation is already pending for this email");
    }

    const token = crypto.randomBytes(32).toString("hex");

    return invitationRepository.create({
      email: input.email,
      role: input.role,
      workspaceId,
      invitedById,
      token,
    });
  },

  async listPending(workspaceId: string) {
    return invitationRepository.findPendingByWorkspace(workspaceId);
  },

  async accept(token: string, userId: string) {
    const invitation = await invitationRepository.findByToken(token);

    if (!invitation) {
      throw new ApiError(404, "Invitation not found");
    }
    if (invitation.accepted) {
      throw new ApiError(409, "This invitation has already been used");
    }

    // Fetch the logged-in user's CURRENT email from the DB — never trust a
    // client-supplied or stale JWT-payload email for this security check.
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    if (invitation.email.toLowerCase() !== user.email.toLowerCase()) {
      throw new ApiError(403, "This invitation was sent to a different email address");
    }

    const existingMembership = await memberRepository.findOne(invitation.workspaceId, userId);
    if (existingMembership) {
      await invitationRepository.markAccepted(invitation.id);
      throw new ApiError(409, "You are already a member of this workspace");
    }

    const member = await memberRepository.create(
      invitation.workspaceId,
      userId,
      invitation.role as "ADMIN" | "MEMBER"
    );

    await invitationRepository.markAccepted(invitation.id);

    return { member, workspace: invitation.workspace };
  },
};