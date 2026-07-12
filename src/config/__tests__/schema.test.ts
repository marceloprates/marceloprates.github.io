import { describe, expect, it } from "vitest";
import {
	SectionConfigSchema,
	SectionIdSchema,
	SectionsArraySchema,
	SiteOwnerSchema,
	SocialSchema,
} from "../schema";

describe("SiteOwnerSchema", () => {
	const valid = {
		name: "Marcelo de Oliveira Rosa Prates",
		shortName: "Marcelo Prates",
		role: "Software developer",
		location: "Porto Alegre, Brazil",
		birthDate: "1992-09-09",
	};

	it("accepts a complete owner object", () => {
		expect(SiteOwnerSchema.safeParse(valid).success).toBe(true);
	});

	it("rejects empty fields", () => {
		expect(SiteOwnerSchema.safeParse({ ...valid, name: "" }).success).toBe(false);
		expect(SiteOwnerSchema.safeParse({ ...valid, role: "" }).success).toBe(false);
	});

	it("rejects malformed birthDate", () => {
		expect(SiteOwnerSchema.safeParse({ ...valid, birthDate: "1992/09/09" }).success).toBe(
			false,
		);
		expect(SiteOwnerSchema.safeParse({ ...valid, birthDate: "1992-9-9" }).success).toBe(
			false,
		);
		expect(SiteOwnerSchema.safeParse({ ...valid, birthDate: "today" }).success).toBe(
			false,
		);
	});

	it("accepts birthDate in YYYY-MM-DD format", () => {
		expect(SiteOwnerSchema.safeParse({ ...valid, birthDate: "2000-01-01" }).success).toBe(
			true,
		);
	});
});

describe("SocialSchema", () => {
	it("requires a github URL", () => {
		expect(SocialSchema.safeParse({ github: "https://github.com/x" }).success).toBe(true);
	});

	it("rejects non-URL github", () => {
		expect(SocialSchema.safeParse({ github: "not-a-url" }).success).toBe(false);
	});

	it("allows optional semanticScholar URL", () => {
		const r1 = SocialSchema.safeParse({ github: "https://github.com/x" });
		const r2 = SocialSchema.safeParse({
			github: "https://github.com/x",
			semanticScholar: "https://semanticscholar.org/author/x",
		});
		expect(r1.success).toBe(true);
		expect(r2.success).toBe(true);
	});
});

describe("SectionIdSchema", () => {
	it("accepts the two allowed section ids", () => {
		for (const id of ["hero", "about"]) {
			expect(SectionIdSchema.safeParse(id).success).toBe(true);
		}
	});

	it("rejects removed section ids", () => {
		for (const id of [
			"quick-tiles",
			"selected-projects",
			"open-source",
			"papers",
			"resume",
		]) {
			expect(SectionIdSchema.safeParse(id).success).toBe(false);
		}
	});

	it("rejects unknown section ids", () => {
		expect(SectionIdSchema.safeParse("footer").success).toBe(false);
		expect(SectionIdSchema.safeParse("").success).toBe(false);
	});
});

describe("SectionConfigSchema", () => {
	it("accepts a valid config entry", () => {
		expect(SectionConfigSchema.safeParse({ id: "hero", enabled: true }).success).toBe(true);
		expect(SectionConfigSchema.safeParse({ id: "about", enabled: true }).success).toBe(true);
	});

	it("rejects unknown id", () => {
		expect(SectionConfigSchema.safeParse({ id: "wat", enabled: true }).success).toBe(
			false,
		);
	});

	it("requires enabled to be boolean", () => {
		expect(SectionConfigSchema.safeParse({ id: "hero", enabled: "yes" }).success).toBe(
			false,
		);
	});
});

describe("SectionsArraySchema", () => {
	it("accepts an empty array", () => {
		expect(SectionsArraySchema.safeParse([]).success).toBe(true);
	});

	it("accepts the full sections list", () => {
		const list = [
			{ id: "hero", enabled: true },
			{ id: "about", enabled: true },
		];
		expect(SectionsArraySchema.safeParse(list).success).toBe(true);
	});

	it("rejects if any entry is invalid", () => {
		const list = [
			{ id: "hero", enabled: true },
			{ id: "wat", enabled: true },
		];
		expect(SectionsArraySchema.safeParse(list).success).toBe(false);
	});
});