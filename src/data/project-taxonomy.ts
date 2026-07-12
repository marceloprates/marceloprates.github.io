/**
 * Project taxonomy — primary categories + tags.
 *
 * The taxonomy is intentionally flat: each project carries ONE primary
 * category (driving its main URL/filter slot) and any number of tags.
 * This mirrors the faceted-classification convention (Ranganathan 1933
 * + NNG "Faceted Search" guidance): a single primary facet gives us
 * stable IA, while free-form tags power the /projects filter and the ⌘K
 * command palette without combinatorial URL explosion.
 *
 * The four primaries were chosen to match the user's actual output
 * (locked decision 2026-07-12, see .ralph/nav-redesign.md):
 *   - code:        libraries, dev tools, CLIs
 *   - art:         generative art, data art, visual experiments
 *   - writing:     posts and essays
 *   - experiments: one-offs, hacks, simulations
 *
 * Open Source is NOT a primary — it is a `tag: open-source` filter on
 * /projects. This avoids the Projects / Open Source / Papers redundancy
 * the old bento had.
 */

export const PRIMARY_CATEGORIES = [
    "code",
    "art",
    "writing",
    "experiments",
] as const;

export type PrimaryCategory = (typeof PRIMARY_CATEGORIES)[number];

/**
 * Display labels for the four primary categories. Capitalized, ready
 * for the segmented control + filter chips on /projects.
 */
export const PRIMARY_LABEL: Record<PrimaryCategory, string> = {
    code: "Code",
    art: "Art",
    writing: "Writing",
    experiments: "Experiments",
};

/**
 * Type-guard: is a string one of the four known primaries? Used by
 * the Zod schema for project frontmatter (`primary?: PrimaryCategory`).
 */
export function isPrimaryCategory(s: string): s is PrimaryCategory {
    return (PRIMARY_CATEGORIES as readonly string[]).includes(s);
}