/**
 * Project taxonomy — primary categories + tags.
 *
 * The taxonomy is intentionally flat: each project carries ONE primary
 * category (driving its main URL/filter slot) and any number of tags.
 * This mirrors the faceted-classification convention (Ranganathan 1933
 * + NNG "Faceted Search" guidance): a single primary facet gives us
 * stable IA, while free-form tags power the /work filter and the ⌘K
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
 * /work. This avoids the Projects / Open Source / Papers redundancy
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
 * for the segmented control + filter chips on /work.
 */
export const PRIMARY_LABEL: Record<PrimaryCategory, string> = {
    code: "Code",
    art: "Art",
    writing: "Writing",
    experiments: "Experiments",
};

/**
 * Tailwind gradient class per primary. Reused on /work chips so the
 * visual identity stays consistent with the home-page section
 * gradients. Keep in sync with src/components/sections/Section.tsx
 * gradient strings when adding new primaries.
 */
export const PRIMARY_GRADIENT: Record<PrimaryCategory, string> = {
    code: "from-blue-500 via-indigo-500 to-purple-500",
    art: "from-pink-500 via-rose-500 to-orange-400",
    writing: "from-yellow-400 to-orange-500",
    experiments: "from-emerald-500 via-teal-500 to-cyan-500",
};

/**
 * Type-guard: is a string one of the four known primaries? Used by
 * the Zod schema for project frontmatter (`primary?: PrimaryCategory`).
 */
export function isPrimaryCategory(s: string): s is PrimaryCategory {
    return (PRIMARY_CATEGORIES as readonly string[]).includes(s);
}

/**
 * The reserved "open-source" tag. Surfaced as a dedicated toggle on
 * /work so visitors (especially recruiters) can find repos with one
 * click. The tag itself is just a string; we expose a constant here
 * so the value can't drift between renderer + filter.
 */
export const OPEN_SOURCE_TAG = "open-source" as const;