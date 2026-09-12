import crypto from "crypto";
import { invitationRepository } from "../repositories/invitation.repository";
import { memberRepository } from "../repositories/member.repository";
import { userRepository } from "../repositories/user.repository";
import { notificationRepository } from "../repositories/notificcation.repository";
import { CreateInvitationInput } from "../validators/invitation.validator";
import { ApiError } from "./auth.service";
import { prisma } from "../config/prisma";

function canInvite(actorRole: string) {
  return actorRole === "OWNER" || actorRole === "ADMIN";
}

export const invitationService = {
  async create(
    input: CreateInvitationInput,
    workspaceId: string,
    invitedById: string,
    actorRole: string,
  ) {
    if (!canInvite(actorRole)) {
      throw new ApiError(
        403,
        "Only owners and admins can invite members",
      );
    }

    // Only OWNER can invite someone as ADMIN
    if (input.role === "ADMIN" && actorRole !== "OWNER") {
      throw new ApiError(
        403,
        "Only the workspace owner can invite someone as ADMIN",
      );
    }

    const email = input.email.trim().toLowerCase();

    // Check workspace
    const workspace = await prisma.workspace.findUnique({
      where: {
        id: workspaceId,
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    if (!workspace) {
      throw new ApiError(404, "Workspace not found");
    }

    // Check if user already exists
    const existingUser = await userRepository.findByEmail(email);

    if (existingUser) {
      const existingMembership = await memberRepository.findOne(
        workspaceId,
        existingUser.id,
      );

      if (existingMembership) {
        throw new ApiError(
          409,
          "This user is already a member of the workspace",
        );
      }
    }

    // Check duplicate pending invitation
    const pendingInvite =
      await invitationRepository.findPendingByEmailInWorkspace(
        email,
        workspaceId,
      );

    if (pendingInvite) {
      throw new ApiError(
        409,
        "An invitation is already pending for this email",
      );
    }

    // Generate secure invitation token
    const token = crypto.randomBytes(32).toString("hex");

    // Create invitation ONCE
    const invitation = await invitationRepository.create({
      email,
      role: input.role,
      workspaceId,
      invitedById,
      token,
    });

    // If invited user already has a Nexus account,
    // create an in-app notification.
    if (existingUser) {
      await notificationRepository.create({
        userId: existingUser.id,
        type: "INVITATION",
        invitationId: invitation.id,
        message: `You have been invited to join ${workspace.name}`,
      });
    }

    return invitation;
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
      throw new ApiError(
        409,
        "This invitation has already been used",
      );
    }

    // Fetch current user from DB
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Invitation email must match logged-in user's email
    if (invitation.email.toLowerCase() !== user.email.toLowerCase()) {
      throw new ApiError(
        403,
        "This invitation was sent to a different email address",
      );
    }

    // Check existing membership
    const existingMembership = await memberRepository.findOne(
      invitation.workspaceId,
      userId,
    );

    if (existingMembership) {
      throw new ApiError(
        409,
        "You are already a member of this workspace",
      );
    }

    // Create membership
    const member = await memberRepository.create(
      invitation.workspaceId,
      userId,
      invitation.role as "ADMIN" | "MEMBER",
    );

    // Mark invitation as accepted
    await invitationRepository.markAccepted(invitation.id);

    return {
      member,
      workspace: invitation.workspace,
    };
  },
};