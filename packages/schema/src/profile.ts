import { z } from "zod";
import { ImageAssetSchema, LinkSchema, ProjectSchema, TimelineEntrySchema } from "./blocks";

export const RESERVED_USERNAMES = new Set([
  "api", "app", "admin", "login", "signup", "settings", "about",
  "pricing", "terms", "privacy", "legal", "help", "support", "blog",
  "assets", "static", "explore",
]);

export const UsernameSchema = z
  .string()
  .min(3)
  .max(30)
  .regex(/^[a-z0-9](?:[a-z0-9._]*[a-z0-9])?$/, {
    message:
      "Lowercase letters, numbers, dots and underscores; must start and end with a letter or number",
  })
  .refine((u) => !RESERVED_USERNAMES.has(u), { message: "Username unavailable" });

/**
 * The profile home page is a fixed template. Every field below maps to
 * one region of the design, top to bottom. Optional fields collapse —
 * an empty biography means no Biography card, etc.
 */
export const ProfileSchema = z.object({
  username: UsernameSchema,
  displayName: z.string().min(1).max(80), // "Erica Bonifacio"
  role: z.string().max(80).optional(),    // "Art Director"
  hero: ImageAssetSchema,

  /** Opens as a sheet from the Biography card */
  biography: z.string().max(2000).optional(),

  /** "Timeline" sheet behind the Experience row */
  experience: z.array(TimelineEntrySchema).max(20).default([]),

  /** Featured project cards, in display order */
  projects: z.array(ProjectSchema).max(20).default([]),

  /** Shows the Contact row + form sheet */
  contactEnabled: z.boolean().default(true),

  /** Footer social icons (instagram / x / youtube get brand icons) */
  social: z.array(LinkSchema).max(6).default([]),

  updatedAt: z.string().datetime(),
});
export type Profile = z.infer<typeof ProfileSchema>;

/** Payload for the contact form endpoint */
export const ContactMessageSchema = z.object({
  toUsername: UsernameSchema,
  name: z.string().min(1).max(120),
  email: z.string().email(),
  message: z.string().min(1).max(4000),
});
export type ContactMessage = z.infer<typeof ContactMessageSchema>;
