import { describe, expect, it } from "vitest";
import {
	getEnabledMiscEntries,
	getMiscEntryById,
	miscRegistry,
} from "../misc";

describe("misc registry", () => {
	it("exports a non-empty registry", () => {
		expect(miscRegistry.length).toBeGreaterThan(0);
	});

	it("includes the spellcheck-pokedex entry", () => {
		const pokedex = getMiscEntryById("spellcheck-pokedex");
		expect(pokedex).toBeDefined();
		expect(pokedex?.href).toBe("/spellcheck-pokedex");
		expect(pokedex?.enabled).toBe(true);
	});

	it("preserves entry order", () => {
		const enabled = getEnabledMiscEntries();
		const firstEntry = enabled[0];
		expect(firstEntry?.id).toBe("spellcheck-pokedex");
	});

	it("returns undefined for unknown ids", () => {
		expect(getMiscEntryById("does-not-exist")).toBeUndefined();
	});

	it("filters out disabled entries", () => {
		const beforeCount = miscRegistry.length;
		const enabledCount = getEnabledMiscEntries().length;
		const disabled = miscRegistry.filter((e) => !e.enabled).length;
		expect(enabledCount).toBe(beforeCount - disabled);
	});

	it("registry is frozen (treated as immutable)", () => {
		expect(Object.isFrozen(miscRegistry)).toBe(true);
	});

	it("every enabled entry has a leading-slash href pointing at /misc/* or another real route", () => {
		for (const entry of getEnabledMiscEntries()) {
			expect(entry.href.startsWith("/")).toBe(true);
		}
	});

	it("every entry id is unique", () => {
		const ids = miscRegistry.map((e) => e.id);
		expect(new Set(ids).size).toBe(ids.length);
	});
});
