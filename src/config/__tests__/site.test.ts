import { describe, expect, it } from "vitest";
import { computeAge, siteConfig } from "../site";

describe("siteConfig", () => {
	it("has a valid owner", () => {
		expect(siteConfig.owner.name).toBe("Marcelo de Oliveira Rosa Prates");
		expect(siteConfig.owner.shortName).toBe("Marcelo Prates");
		expect(siteConfig.owner.birthDate).toBe("1992-09-09");
	});

	it("has a github social link", () => {
		expect(siteConfig.social.github).toBe("https://github.com/marceloprates");
	});
});

describe("computeAge", () => {
	it("returns correct age when birthday has passed this year", () => {
		// Born 1992-09-09, on 2026-07-12 → 33
		const now = new Date(2026, 6, 12); // July 12, 2026
		expect(computeAge("1992-09-09", now)).toBe(33);
	});

	it("returns one less when birthday has not happened yet this year", () => {
		// Born 1992-09-09, on 2026-10-01 → 34
		const now = new Date(2026, 9, 1); // Oct 1, 2026
		expect(computeAge("1992-09-09", now)).toBe(34);
	});

	it("handles birthday on the same day", () => {
		// Born 1992-09-09, on 2026-09-09 → 34
		const now = new Date(2026, 8, 9); // Sep 9, 2026
		expect(computeAge("1992-09-09", now)).toBe(34);
	});

	it("handles day-before-birthday", () => {
		// Born 1992-09-09, on 2026-09-08 → 33 (one day short)
		const now = new Date(2026, 8, 8); // Sep 8, 2026
		expect(computeAge("1992-09-09", now)).toBe(33);
	});

	it("handles leap years (Feb 29)", () => {
		// Born 2000-02-29, on 2026-02-28 → 25 (birthday not yet)
		const now = new Date(2026, 1, 28);
		expect(computeAge("2000-02-29", now)).toBe(25);
	});

	it("defaults to current date when `now` is not passed", () => {
		const age = computeAge("1992-09-09");
		// Should be a positive integer
		expect(Number.isInteger(age)).toBe(true);
		expect(age).toBeGreaterThan(30);
		expect(age).toBeLessThan(50);
	});
});