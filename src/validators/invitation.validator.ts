import { z } from "zod";

export const createInvitationSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
  // OWNER is intentionally excluded — ownership isn't granted via invitation
});

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;