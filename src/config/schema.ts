import { z } from "zod";

/**
 * Zod schemas for site + sections configuration.
 *
 * Used by src/config/site.ts and src/config/sections.ts to validate
 * their exports at module load time. Parse errors throw and surface
 * at build rather than at render.
 */

/** Owner identity — name, role, location, birth date. */
export const SiteOwnerSchema = z.object({
	name: z.string().min(1),
	shortName: z.string().min(1),
	role: z.string().min(1),
	location: z.string().min(1),
	birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "birthDate must be YYYY-MM-DD"),
});

/** Social/external links surfaced from the home page and footer. */
export const SocialSchema = z.object({
	github: z.url(),
	semanticScholar: z.url().optional(),
});

/**
 * Allowed section IDs for the home page composition.
 *
 * As of nav-redesign Phase C (2026-07-12), the home page is reduced
 * to Hero + About. The deleted sections (quick-tiles, selected-
 * projects, open-source, papers, resume) live on /projects, /about, and
 * /resume now — see src/app/(content)/projects/page.tsx,
 * src/app/(content)/about/page.tsx, src/app/(content)/resume/page.tsx.
 */
export const SectionIdSchema = z.enum(["hero", "about"]);

/** A single section entry: id + visibility flag. */
export const SectionConfigSchema = z.object({
	id: SectionIdSchema,
	enabled: z.boolean(),
});

/** Ordered array of section configs. Order is preserved at render time. */
export const SectionsArraySchema = z.array(SectionConfigSchema);

// Inferred TS types (single source of truth — schema is the spec).
export type SiteOwner = z.infer<typeof SiteOwnerSchema>;
export type Social = z.infer<typeof SocialSchema>;
export type SectionConfig = z.infer<typeof SectionConfigSchema>;
