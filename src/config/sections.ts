import { SectionsArraySchema } from "./schema";
import type { SectionConfig } from "./schema";

/**
 * Ordered list of home-page sections.
 *
 * Order is the render order. Toggle `enabled` to hide a section
 * without removing it (useful for A/B testing or "focus" modes).
 * Validated at module load against SectionsArraySchema — typo in
 * `id` throws at build.
 *
 * As of nav-redesign Phase C (2026-07-12), the home page is
 * deliberately minimal: Hero + About only. Every other surface
 * lives at its own route:
 *   - /work      — faceted grid of all projects (Phase D)
 *   - /posts     — blog/essays (unchanged)
 *   - /about     — full About page, see AboutSection (Phase E)
 *   - /resume    — resume tabs (Phase E)
 *   - /misc      — registry index (unchanged)
 */
export const sections: readonly SectionConfig[] = SectionsArraySchema.parse([
	{ id: "hero", enabled: true },
	{ id: "about", enabled: true },
]);

/** Predicate: is this section currently rendered? */
export function isEnabled(s: SectionConfig): boolean {
	return s.enabled;
}
