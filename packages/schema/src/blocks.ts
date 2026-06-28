import { z } from "zod";

/**
 * Content model
 * ─────────────
 * Two levels, mirroring the design:
 *
 * 1. PROFILE (home) — a fixed template, not a free block list. The page
 *    is always: hero card → biography → section nav → project cards →
 *    footer. Users fill slots; they don't arrange them. (The Instagram
 *    constraint, taken literally.)
 *
 * 2. PROJECT (detail) — an ordered list of content blocks:
 *    story | media | quote | links | video.
 *
 * Shared by the iOS editor, the API and the web renderer.
 */

// ── Shared primitives ────────────────────────────────────────────────

export const ImageAssetSchema = z.object({
  src: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  alt: z.string().default(""),
  placeholder: z.string().optional(), // blurhash/thumbhash
});
export type ImageAsset = z.infer<typeof ImageAssetSchema>;

export const LinkSchema = z.object({
  label: z.string().min(1).max(60),
  url: z.string().url(),
});
export type Link = z.infer<typeof LinkSchema>;

// ── Project content blocks ───────────────────────────────────────────

const blockBase = { id: z.string().min(1) };

/** Text card. Design shows these titled "The Story". */
export const StoryBlockSchema = z.object({
  ...blockBase,
  type: z.literal("story"),
  data: z.object({
    heading: z.string().max(60).default("The Story"),
    text: z.string().max(2000),
  }),
});

const mediaData = z.object({
  images: z.array(ImageAssetSchema).min(1).max(12),
  caption: z.string().max(60).optional(),
});

/** Swipeable card deck. */
export const MediaSwipeBlockSchema = z.object({
  ...blockBase,
  type: z.literal("media-swipe"),
  data: mediaData,
});

/** Swiper creative-effect carousel with pagination. */
export const MediaCarouselBlockSchema = z.object({
  ...blockBase,
  type: z.literal("media-carousel"),
  data: mediaData,
});

/** Large centred pull quote. Quotation marks are added by the renderer. */
export const QuoteBlockSchema = z.object({
  ...blockBase,
  type: z.literal("quote"),
  data: z.object({
    text: z.string().max(240),
  }),
});

/** External links card. */
export const LinksBlockSchema = z.object({
  ...blockBase,
  type: z.literal("links"),
  data: z.object({
    heading: z.string().max(60).default("Links"),
    links: z.array(LinkSchema).min(1).max(8),
  }),
});

/** Single video with poster. */
export const VideoBlockSchema = z.object({
  ...blockBase,
  type: z.literal("video"),
  data: z.object({
    src: z.string().min(1),
    poster: ImageAssetSchema.optional(),
  }),
});

/** Single full-width photo. */
export const PhotoBlockSchema = z.object({
  ...blockBase,
  type: z.literal("photo"),
  data: ImageAssetSchema,
});

export const ProjectBlockSchema = z.discriminatedUnion("type", [
  StoryBlockSchema,
  MediaSwipeBlockSchema,
  MediaCarouselBlockSchema,
  QuoteBlockSchema,
  LinksBlockSchema,
  VideoBlockSchema,
  PhotoBlockSchema,
]);
export type ProjectBlock = z.infer<typeof ProjectBlockSchema>;
export type ProjectBlockType = ProjectBlock["type"];

// ── Project entity ───────────────────────────────────────────────────

export const ProjectSlugSchema = z
  .string()
  .min(1)
  .max(60)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const VideoAssetSchema = z.object({
  src: z.string().min(1),
  poster: z.string().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});
export type VideoAsset = z.infer<typeof VideoAssetSchema>;

export const ProjectSchema = z.object({
  slug: ProjectSlugSchema,
  title: z.string().min(1).max(80),
  subtitle: z.string().max(120).optional(),
  year: z.number().int().min(1900).max(2100).optional(),
  /** Cover image used by project cards (also serves as video poster) */
  cover: ImageAssetSchema,
  /** Optional video to play instead of the cover image on project cards */
  coverVideo: VideoAssetSchema.optional(),
  blocks: z.array(ProjectBlockSchema).max(30),
});
export type Project = z.infer<typeof ProjectSchema>;

// ── Profile sections (fixed template) ────────────────────────────────

export const TimelineEntrySchema = z.object({
  id: z.string().min(1),
  period: z.string().min(1).max(30), // "2013 – 2014"
  title: z.string().min(1).max(80),  // "Parsons School of Design"
  subtitle: z.string().max(80).optional(), // "Fashion Degree"
});
export type TimelineEntry = z.infer<typeof TimelineEntrySchema>;
