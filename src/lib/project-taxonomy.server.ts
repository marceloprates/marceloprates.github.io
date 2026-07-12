/**
 * Project taxonomy resolvers (server-only).
 *
 * Two pure functions used by /work and the ⌘K palette to enrich
 * project records with a primary category and merged tags.
 *
 * - `assignPrimary`: decide which of the 4 primaries a project belongs
 *   to. Markdown frontmatter wins; the seed table fills the gaps.
 * - `mergeTags`: concatenate existing tags with seed tags, dedupe
 *   case-insensitively while preserving the first occurrence's casing
 *   (so the original "Python" from GitHub isn't overwritten by a
 *   lowercase "python" from the seed).
 *
 * Both are pure, dependency-free, and trivially testable.
 */

import {
    PRIMARY_CATEGORIES,
    isPrimaryCategory,
    type PrimaryCategory,
} from "@/data/project-taxonomy";
import { SEED } from "@/data/project-taxonomy.seed";

export interface AssignPrimaryInput {
    /** GitHub owner/name, when known. Preferred over slug. */
    repo?: string;
    /** Markdown slug (basename of content/projects/<slug>.md). */
    slug?: string;
    /** Explicit override from project frontmatter. Always wins. */
    frontmatterPrimary?: string;
}

const FALLBACK_PRIMARY: PrimaryCategory = "code";

/**
 * Decide the primary category for a project. See module docstring for
 * priority. Falls back to "code" when nothing matches — preserves the
 * existing behaviour where most dev/CLI projects default to code.
 */
export function assignPrimary(input: AssignPrimaryInput): PrimaryCategory {
    const fm = input.frontmatterPrimary?.trim();
    if (fm && isPrimaryCategory(fm)) {
        return fm;
    }
    const key = input.repo ?? input.slug;
    if (key) {
        const seed = SEED[key];
        if (seed) return seed.primary;
    }
    return FALLBACK_PRIMARY;
}

export interface MergeTagsInput {
    /** Tags already on the project (GitHub-derived or frontmatter). */
    existing: readonly string[];
    /** Same lookup key as `assignPrimary`. */
    repo?: string;
    /** Same lookup key as `assignPrimary`. */
    slug?: string;
}

/**
 * Merge existing tags with seed tags. Preserves order: existing tags
 * come first, new seed tags are appended. Dedupe is case-insensitive
 * but the first occurrence's casing wins (so "Python" from GitHub
 * beats a later "python" from the seed).
 */
export function mergeTags(input: MergeTagsInput): string[] {
    const key = input.repo ?? input.slug;
    const seedTags = key ? (SEED[key]?.tags ?? []) : [];
    const seen = new Set<string>();
    const out: string[] = [];
    for (const raw of [...input.existing, ...seedTags]) {
        const norm = raw.trim().toLowerCase();
        if (!norm) continue;
        if (seen.has(norm)) continue;
        seen.add(norm);
        out.push(raw.trim());
    }
    return out;
}

/**
 * Convenience: list all primary categories. Re-exported from the data
 * module so consumers can `import { listPrimaries } from "@/lib/..."`
 * without touching the data module.
 */
export function listPrimaries(): readonly PrimaryCategory[] {
    return PRIMARY_CATEGORIES;
}