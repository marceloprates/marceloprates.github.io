import { describe, expect, it } from "vitest";
import {
	PortfolioFrontmatterSchema,
	PortfolioPrimarySchema,
	PortfolioTierSchema,
	PORTFOLIO_DEFAULT_TIER,
	type PortfolioFrontmatter,
	type ResolvedPortfolioFrontmatter,
} from "../portfolio-schema";

describe("PortfolioFrontmatterSchema", () => {
	const minimal = { include: true };

	it("accepts a minimal entry with only the required include flag", () => {
		expect(PortfolioFrontmatterSchema.safeParse(minimal).success).toBe(true);
	});

	it("accepts a complete entry with summary, tags, cover, slug, primary, tier", () => {
		const complete = {
			include: true,
			tier: "featured",
			summary: "A short pitch for the card.",
			tags: ["python", "llm", "rag"],
			cover: "docs/screenshot.png",
			slug: "my-project",
			primary: "code",
		};
		expect(PortfolioFrontmatterSchema.safeParse(complete).success).toBe(true);
	});

	it("accepts include: false (explicit opt-out)", () => {
		expect(PortfolioFrontmatterSchema.safeParse({ include: false }).success).toBe(true);
	});

	it("rejects an entry without include", () => {
		// The only required field is `include`. Omitting it must fail.
		expect(PortfolioFrontmatterSchema.safeParse({}).success).toBe(false);
	});

	it("rejects non-boolean include", () => {
		expect(PortfolioFrontmatterSchema.safeParse({ include: "yes" }).success).toBe(false);
		expect(PortfolioFrontmatterSchema.safeParse({ include: 1 }).success).toBe(false);
	});

	it("rejects unknown primary values", () => {
		expect(
			PortfolioFrontmatterSchema.safeParse({ include: true, primary: "music" }).success,
		).toBe(false);
		expect(
			PortfolioFrontmatterSchema.safeParse({ include: true, primary: "codex" }).success,
		).toBe(false);
	});

	it("accepts each of the four locked primary values", () => {
		for (const primary of ["code", "art", "writing", "experiments"] as const) {
			expect(
				PortfolioFrontmatterSchema.safeParse({ include: true, primary }).success,
			).toBe(true);
		}
	});

	it("rejects unknown tier values", () => {
		expect(
			PortfolioFrontmatterSchema.safeParse({ include: true, tier: "top" }).success,
		).toBe(false);
		expect(
			PortfolioFrontmatterSchema.safeParse({ include: true, tier: "" }).success,
		).toBe(false);
	});

	it("accepts each of the three locked tier values", () => {
		for (const tier of ["featured", "normal", "hidden"] as const) {
			expect(
				PortfolioFrontmatterSchema.safeParse({ include: true, tier }).success,
			).toBe(true);
		}
	});

	it("accepts tags as a list of strings", () => {
		expect(
			PortfolioFrontmatterSchema.safeParse({ include: true, tags: ["a", "b"] }).success,
		).toBe(true);
	});

	it("rejects tags with non-string entries", () => {
		expect(
			PortfolioFrontmatterSchema.safeParse({ include: true, tags: ["a", 1] }).success,
		).toBe(false);
	});

	it("preserves unknown frontmatter fields via passthrough", () => {
		const withExtras = {
			...minimal,
			// Author may add ad-hoc fields; we preserve them so downstream
			// consumers can read them without us having to model every
			// conceivable field.
			custom_flag: true,
			notes: "internal-only annotation",
			arbitrary: { deeply: { nested: "value" } },
		};
		const result = PortfolioFrontmatterSchema.parse(withExtras) as PortfolioFrontmatter & {
			custom_flag?: boolean;
			notes?: string;
			arbitrary?: { deeply: { nested: string } };
		};
		expect(result.custom_flag).toBe(true);
		expect(result.notes).toBe("internal-only annotation");
		expect(result.arbitrary).toEqual({ deeply: { nested: "value" } });
	});

	it("preserves falsy include: false explicitly (does not coerce to true)", () => {
		const result = PortfolioFrontmatterSchema.parse({ include: false });
		expect(result.include).toBe(false);
	});
});

describe("PortfolioPrimarySchema", () => {
	it("accepts the four locked values", () => {
		for (const v of ["code", "art", "writing", "experiments"] as const) {
			expect(PortfolioPrimarySchema.safeParse(v).success).toBe(true);
		}
	});

	it("rejects other strings", () => {
		expect(PortfolioPrimarySchema.safeParse("").success).toBe(false);
		expect(PortfolioPrimarySchema.safeParse("Code").success).toBe(false); // case-sensitive
		expect(PortfolioPrimarySchema.safeParse("music").success).toBe(false);
	});
});

describe("PortfolioTierSchema", () => {
	it("accepts the three locked values", () => {
		for (const v of ["featured", "normal", "hidden"] as const) {
			expect(PortfolioTierSchema.safeParse(v).success).toBe(true);
		}
	});

	it("rejects other strings", () => {
		expect(PortfolioTierSchema.safeParse("").success).toBe(false);
		expect(PortfolioTierSchema.safeParse("Featured").success).toBe(false);
		expect(PortfolioTierSchema.safeParse("archive").success).toBe(false);
	});
});

describe("PORTFOLIO_DEFAULT_TIER", () => {
	it("is 'normal'", () => {
		// The default tier is the keystone of the sort contract — if it ever
		// changes, the card-grid sort changes too. Pin the value here so
		// the change is deliberate, not accidental.
		expect(PORTFOLIO_DEFAULT_TIER).toBe("normal");
	});
});

describe("ResolvedPortfolioFrontmatter (build-time shape)", () => {
	it("requires tier to be present (consumers may rely on non-optional tier)", () => {
		// Compile-time type assertion: ResolvedPortfolioFrontmatter.tier is
		// non-optional. If the type ever drifts, this fails to typecheck.
		const resolved: ResolvedPortfolioFrontmatter = {
			include: true,
			tier: "normal",
		};
		expect(resolved.tier).toBe("normal");
	});
});
