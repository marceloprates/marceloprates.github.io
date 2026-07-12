import { describe, expect, it } from "vitest";
import { MiscArraySchema, MiscEntrySchema } from "../misc-schema";

describe("MiscEntrySchema", () => {
	const valid = {
		id: "spellcheck-pokedex",
		title: "Pokédex Spellcheck Reference",
		href: "/misc/spellcheck-pokedex",
		description: "All Pokémon names run through spell checkers.",
		enabled: true,
	};

	it("accepts a complete entry with required fields only", () => {
		expect(MiscEntrySchema.safeParse(valid).success).toBe(true);
	});

	it("accepts an entry with icon and category", () => {
		const withExtras = { ...valid, icon: "/globe.svg", category: "reference" };
		expect(MiscEntrySchema.safeParse(withExtras).success).toBe(true);
	});

	it("rejects empty title, description, or href", () => {
		expect(MiscEntrySchema.safeParse({ ...valid, title: "" }).success).toBe(false);
		expect(MiscEntrySchema.safeParse({ ...valid, description: "" }).success).toBe(false);
		expect(MiscEntrySchema.safeParse({ ...valid, href: "" }).success).toBe(false);
	});

	it("rejects non-kebab-case id", () => {
		expect(MiscEntrySchema.safeParse({ ...valid, id: "Has Space" }).success).toBe(false);
		expect(MiscEntrySchema.safeParse({ ...valid, id: "CamelCase" }).success).toBe(false);
		expect(MiscEntrySchema.safeParse({ ...valid, id: "snake_case" }).success).toBe(false);
	});

	it("rejects non-leading-slash href", () => {
		expect(MiscEntrySchema.safeParse({ ...valid, href: "misc/foo" }).success).toBe(false);
		expect(MiscEntrySchema.safeParse({ ...valid, href: "https://example.com" }).success).toBe(false);
	});

	it("accepts href of any path, including nested", () => {
		expect(MiscEntrySchema.safeParse({ ...valid, href: "/deep/nested/route" }).success).toBe(true);
	});

	it("rejects missing enabled flag", () => {
		const noEnabled = { ...valid };
		delete (noEnabled as Record<string, unknown>).enabled;
		expect(MiscEntrySchema.safeParse(noEnabled).success).toBe(false);
	});

	it("accepts enabled: false (kept in registry, filtered at render)", () => {
		expect(MiscEntrySchema.safeParse({ ...valid, enabled: false }).success).toBe(true);
	});

	it("rejects icon when not absolute path", () => {
		expect(MiscEntrySchema.safeParse({ ...valid, icon: "globe.svg" }).success).toBe(false);
	});
});

describe("MiscArraySchema", () => {
	const entry = {
		id: "spellcheck-pokedex",
		title: "Pokédex",
		href: "/misc/spellcheck-pokedex",
		description: "desc",
		enabled: true,
	};

	it("accepts an empty array", () => {
		expect(MiscArraySchema.safeParse([]).success).toBe(true);
	});

	it("accepts multiple valid entries", () => {
		expect(
			MiscArraySchema.safeParse([
				entry,
				{ ...entry, id: "demo-3d", href: "/demo" },
			]).success
		).toBe(true);
	});

	it("fails the whole array if any single entry is invalid", () => {
		const result = MiscArraySchema.safeParse([entry, { ...entry, id: "BAD ID" }]);
		expect(result.success).toBe(false);
	});
});
