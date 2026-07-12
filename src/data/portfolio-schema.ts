import { z } from "zod";

/**
 * Zod schema for `portfolio.md` frontmatter.
 *
 * `portfolio.md` lives at the root of every repo owned by the user
 * (private or public) and is the source-of-truth for opting a project
 * into the public portfolio. It is fetched at scan time from
 * `raw.githubusercontent.com` and parsed via `gray-matter`. See
 * `scripts/scan-portfolio-candidates.mjs` (Phase B) for the producer
 * and `.ralph/private-portfolio-candidates.md` for the design lock.
 *
 * **Required field**: `include` (bool). When `false`, the repo is treated
 * as opt-out and never surfaces in the candidate report. Default-seeded
 * manifests created by the scanner use `include: true`.
 *
 * **Optional fields**:
 *   - `summary`:  Card excerpt override. Falls back to first paragraph
 *     of the body, then to the existing `desc`.
 *   - `tags`:     Card tag list override. Replaces the auto-derived
 *     GitHub-language tags.
 *   - `cover`:    Path inside the repo (resolved via
 *     `raw.githubusercontent.com`). Replaces the auto-derived cover.
 *   - `slug`:     Canonical `/projects/<slug>` URL segment. Defaults to
 *     the repo name if absent.
 *   - `primary`:  One of the four locked taxonomy primaries. Drives the
 *     `/projects` faceted grid filter.
 *   - `tier`:     `featured | normal | hidden`. Drives sort order on
 *     the card grid (featured first, hidden excluded from default view
 *     but available via filter).
 *
 * Loose (`.passthrough()`) to match `ProjectFrontmatterSchema` and to
 * tolerate ad-hoc author fields without breaking the build. Fails
 * closed only on `include`.
 *
 * **Schema is NOT auto-invoked from the build hot path.** Call
 * `PortfolioFrontmatterSchema.parse()` explicitly from the scan script
 * and from vitest fixtures.
 *
 * @example valid frontmatter
 * ```yaml
 * ---
 * include: true
 * tier: featured
 * summary: >
 *   A short pitch for the card.
 * tags: [python, llm, rag]
 * cover: docs/screenshot.png
 * slug: my-project
 * primary: code
 * ---
 * ```
 */

const PRIMARY_VALUES = ["code", "art", "writing", "experiments"] as const;
export const PortfolioPrimarySchema = z.enum(PRIMARY_VALUES);
export type PortfolioPrimary = z.infer<typeof PortfolioPrimarySchema>;

const TIER_VALUES = ["featured", "normal", "hidden"] as const;
export const PortfolioTierSchema = z.enum(TIER_VALUES);
export type PortfolioTier = z.infer<typeof PortfolioTierSchema>;

export const PortfolioFrontmatterSchema = z
	.object({
		/** Required. `true` to opt the repo into the public portfolio. */
		include: z.boolean(),
		/** Optional. Card excerpt override. */
		summary: z.string().optional(),
		/** Optional. Tag list override. */
		tags: z.array(z.string()).optional(),
		/** Optional. Path in the repo, served via raw.githubusercontent.com. */
		cover: z.string().optional(),
		/** Optional. Canonical `/projects/<slug>` segment. Defaults to repo name. */
		slug: z.string().optional(),
		/** Optional. Taxonomy primary. */
		primary: PortfolioPrimarySchema.optional(),
		/** Optional. Sort tier; defaults to `normal` at consumption time. */
		tier: PortfolioTierSchema.optional(),
	})
	.passthrough();

export type PortfolioFrontmatter = z.infer<typeof PortfolioFrontmatterSchema>;

/**
 * Default tier applied when frontmatter omits `tier`. Kept here so the
 * scan script, the ingestion merger, and the card-grid sort all agree
 * without a magic string floating around the codebase.
 */
export const PORTFOLIO_DEFAULT_TIER: PortfolioTier = "normal";

/**
 * Build-time shape returned by `parsePortfolioFrontmatter()` in the
 * scan script: the parsed frontmatter PLUS the resolved default tier,
 * so downstream consumers never have to special-case missing `tier`.
 */
export type ResolvedPortfolioFrontmatter = PortfolioFrontmatter & {
	tier: PortfolioTier;
};
