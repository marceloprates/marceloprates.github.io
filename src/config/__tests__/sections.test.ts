import { describe, expect, it } from "vitest";
import { isEnabled, sections } from "../sections";
import type { SectionConfig } from "../schema";

describe("sections config", () => {
	it("exports 7 sections in expected order", () => {
		expect(sections.map((s) => s.id)).toEqual([
			"hero",
			"quick-tiles",
			"about",
			"selected-projects",
			"open-source",
			"papers",
			"resume",
		]);
	});

	it("all sections are enabled by default", () => {
		for (const s of sections) {
			expect(s.enabled).toBe(true);
		}
	});

	it("section ids are unique", () => {
		const ids = sections.map((s) => s.id);
		expect(new Set(ids).size).toBe(ids.length);
	});
});

describe("isEnabled", () => {
	it("returns true for enabled sections", () => {
		expect(isEnabled({ id: "hero", enabled: true })).toBe(true);
	});

	it("returns false for disabled sections", () => {
		expect(isEnabled({ id: "about", enabled: false })).toBe(false);
	});

	it("filters array correctly", () => {
		const list: SectionConfig[] = [
			{ id: "hero", enabled: true },
			{ id: "about", enabled: false },
			{ id: "resume", enabled: true },
		];
		const visible = list.filter(isEnabled).map((s) => s.id);
		expect(visible).toEqual(["hero", "resume"]);
	});
});