import { SectionsArraySchema } from "./schema";
import type { SectionConfig } from "./schema";

/**
 * Ordered list of home-page sections.
 *
 * Order is the render order. Toggle `enabled` to hide a section
 * without removing it (useful for A/B testing or "focus" modes).
 *
 * Validated at module load against SectionsArraySchema — typo in
 * `id` throws at build.
 */
export const sections: readonly SectionConfig[] = SectionsArraySchema.parse([
	{ id: "hero", enabled: true },
	{ id: "quick-tiles", enabled: true },
	{ id: "about", enabled: true },
	{ id: "selected-projects", enabled: true },
	{ id: "open-source", enabled: true },
	{ id: "papers", enabled: true },
	{ id: "resume", enabled: true },
]);

/** Predicate: is this section currently rendered? */
export function isEnabled(s: SectionConfig): boolean {
	return s.enabled;
}