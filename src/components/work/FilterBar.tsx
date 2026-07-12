"use client";

/**
 * FilterBar — primary segmented control + tag chips for /work.
 *
 * Pure presentational. Receives `primary` + `tag` from the parent
 * (WorkGrid) and emits `onChange` with the next filter state; the
 * parent is responsible for URL persistence.
 *
 * Visual reference: Material 3 SegmentedButton for the primary
 * row; HF-style chip toggles for the tag cloud.
 *
 * Accessibility floor:
 *   - Segmented buttons: role="radiogroup" + role="radio" /
 *     aria-checked (per WAI ARIA Authoring Practices for radio
 *     groups) so screen reader users get "1 of 4" navigation.
 *   - Tag chips: role="button" + aria-pressed.
 *   - Touch targets ≥ 44 px (h-11).
 *   - Clear "All" / "Open Source" affordances for the most common
 *     combinations.
 */

import {
    PRIMARY_CATEGORIES,
    PRIMARY_LABEL,
    type PrimaryCategory,
} from "@/data/project-taxonomy";

export interface ActiveFilters {
    /** "all" for no primary filter. */
    primary: PrimaryCategory | "all";
    /** null for no tag filter. */
    tag: string | null;
}

export interface FilterBarProps {
    primary: PrimaryCategory | "all";
    tag: string | null;
    /** Lower-cased unique tag list, pre-filtered by current primary. */
    tagUniverse: readonly string[];
    onChange: (next: ActiveFilters) => void;
}

const PRIMARY_OPTIONS: readonly (PrimaryCategory | "all")[] = [
    "all",
    ...PRIMARY_CATEGORIES,
];

const PRIMARY_BUTTON_LABEL: Record<PrimaryCategory | "all", string> = {
    all: "All",
    ...PRIMARY_LABEL,
};

export function FilterBar({
    primary,
    tag,
    tagUniverse,
    onChange,
}: FilterBarProps) {
    return (
        <div className="space-y-4">
            <div
                role="radiogroup"
                aria-label="Filter by primary category"
                className="inline-flex flex-wrap items-center gap-1 p-1 rounded-full bg-gray-100 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10"
            >
                {PRIMARY_OPTIONS.map((p) => {
                    const checked = primary === p;
                    const label = PRIMARY_BUTTON_LABEL[p];
                    return (
                        <button
                            key={p}
                            type="button"
                            role="radio"
                            aria-checked={checked}
                            data-testid={`primary-toggle-${p}`}
                            onClick={() => onChange({ primary: p, tag })}
                            className={`inline-flex items-center justify-center h-10 px-4 rounded-full text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 ${
                                checked
                                    ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm"
                                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            }`}
                        >
                            {label}
                        </button>
                    );
                })}
            </div>

            {tagUniverse.length > 0 && (
                <div
                    role="group"
                    aria-label="Filter by tag"
                    className="flex flex-wrap gap-2"
                >
                    {tagUniverse.map((t) => {
                        const checked = tag?.toLowerCase() === t;
                        return (
                            <button
                                key={t}
                                type="button"
                                aria-pressed={checked}
                                data-testid={`tag-toggle-${t}`}
                                onClick={() =>
                                    onChange({
                                        primary,
                                        tag: checked ? null : t,
                                    })
                                }
                                className={`inline-flex items-center h-11 px-3 rounded-full text-sm font-medium border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 ${
                                    checked
                                        ? "bg-blue-600 text-white border-blue-600 dark:bg-blue-500 dark:border-blue-500"
                                        : "bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 border-black/10 dark:border-white/15 hover:bg-gray-100 dark:hover:bg-white/5"
                                }`}
                            >
                                {t}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

