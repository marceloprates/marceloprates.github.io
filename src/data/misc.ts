import { MiscArraySchema, type MiscEntry } from "./misc-schema";

/**
 * Misc-route registry.
 *
 * Each entry maps to a card on `/misc`. `enabled: false` keeps the entry
 * in source control (history preserved) but hides it from the rendered
 * page via `getEnabledMiscEntries()`.
 *
 * Validated at module load against `MiscArraySchema`. A bad entry throws
 * here and surfaces at `next build` rather than rendering.
 *
 * Add new entries by appending. Order = render order.
 */
const miscEntries: MiscEntry[] = MiscArraySchema.parse([
	{
		id: "spellcheck-pokedex",
		title: "Pokédex Spellcheck Reference",
		href: "/misc/spellcheck-pokedex",
		description:
			"All Pokémon names run through spell checkers in English, Portuguese, and Spanish. Closest real-word matches per language dictionary.",
		icon: "/globe.svg",
		enabled: true,
		category: "reference",
	},
]);

/** Full registry (including disabled entries). Use for admin/inspection only. */
export const miscRegistry: readonly MiscEntry[] = Object.freeze(miscEntries);

/**
 * Filtered registry of entries that should render on `/misc`.
 *
 * Order preserved from the source array. Pure: same input → same output.
 */
export function getEnabledMiscEntries(): readonly MiscEntry[] {
	return miscRegistry.filter((e) => e.enabled);
}

/** Lookup by `id`. Returns `undefined` for unknown ids (purely typed). */
export function getMiscEntryById(id: string): MiscEntry | undefined {
	return miscRegistry.find((e) => e.id === id);
}
