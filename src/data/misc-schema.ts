import { z } from "zod";

/**
 * Zod schemas for the misc-route registry.
 *
 * `src/data/misc.ts` parses its export against `MiscArraySchema` at module
 * load (same pattern as `src/config/sections.ts`). Bad entries fail the
 * build rather than degrade silently.
 *
 * `MiscEntrySchema` covers one /misc card. Fields:
 *   - id: kebab-case slug, used as React key + nav anchor
 *   - title: card heading
 *   - href: relative path the card links to (e.g. '/misc/spellcheck-pokedex')
 *   - description: 1–2 line subtitle on the card
 *   - icon: optional SVG path under /public (e.g. '/globe.svg')
 *   - enabled: false → entry filtered out of /misc but stays in registry
 *              (lets us keep "draft" entries without deleting history)
 *   - category: optional grouping for future filtering/grid sections
 */
export const MiscEntrySchema = z.object({
	id: z
		.string()
		.min(1)
		.regex(/^[a-z0-9-]+$/, "id must be kebab-case"),
	title: z.string().min(1),
	href: z
		.string()
		.min(1)
		.regex(/^\//, "href must start with /"),
	description: z.string().min(1),
	icon: z.string().regex(/^\//).optional(),
	enabled: z.boolean(),
	category: z.string().min(1).optional(),
});

export const MiscArraySchema = z.array(MiscEntrySchema);

export type MiscEntry = z.infer<typeof MiscEntrySchema>;
export type MiscArray = z.infer<typeof MiscArraySchema>;
