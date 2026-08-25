import { z } from "zod";

export const updateMemberRoleSchema = z.object({
  role: z.enum(["ADMIN", "MEMBER"]),
  // Promoting someone to OWNER isn't supported yet (no ownership transfer flow)
});

export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;