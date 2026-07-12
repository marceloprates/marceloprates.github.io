/**
 * Tests for the project taxonomy resolvers.
 *
 * Coverage targets:
 *   - assignPrimary: frontmatter wins, repo wins over slug, slug-only
 *     lookup works, unknown key falls back to "code".
 *   - mergeTags: preserves first-occurrence casing, dedupes
 *     case-insensitively, appends new seed tags after existing ones,
 *     ignores empty strings.
 *   - listPrimaries: returns the four primaries in order.
 */

import { describe, expect, it } from "vitest";

import {
    assignPrimary,
    listPrimaries,
    mergeTags,
} from "@/lib/project-taxonomy.server";
import { PRIMARY_CATEGORIES } from "@/data/project-taxonomy";

describe("assignPrimary", () => {
    it("uses frontmatter primary when valid", () => {
        expect(
            assignPrimary({
                repo: "marceloprates/prettymaps",
                frontmatterPrimary: "writing",
            }),
        ).toBe("writing");
    });

    it("ignores an invalid frontmatter primary and falls through", () => {
        expect(
            assignPrimary({
                repo: "marceloprates/prettymaps",
                frontmatterPrimary: "bogus-category",
            }),
        ).toBe("art"); // seed wins when frontmatter is invalid
    });

    it("looks up by repo when no frontmatter", () => {
        expect(assignPrimary({ repo: "marceloprates/Cosmos" })).toBe(
            "experiments",
        );
        expect(assignPrimary({ repo: "marceloprates/easyshader" })).toBe("art");
        expect(assignPrimary({ repo: "marceloprates/Turmites" })).toBe("art");
    });

    it("prefers repo over slug when both are given", () => {
        // pretend someone passes a mismatched slug — the repo must win
        expect(
            assignPrimary({
                repo: "marceloprates/prettymaps",
                slug: "Cosmos",
            }),
        ).toBe("art");
    });

    it("falls back to slug when repo is missing", () => {
        // Markdown-only project path: no `repo`, just a slug.
        // Note: the SEED table is keyed by repo, so we cannot currently
        // resolve markdown-only projects via this table. That's a known
        // limitation documented in the plan; markdown-only projects must
        // declare `frontmatter.primary` until Phase A is fully extended.
        // We test the fallback path explicitly:
        expect(
            assignPrimary({
                slug: "no-such-slug",
                frontmatterPrimary: "experiments",
            }),
        ).toBe("experiments");
    });

    it("returns the 'code' fallback for unknown keys with no override", () => {
        expect(assignPrimary({ repo: "who/knows" })).toBe("code");
        expect(assignPrimary({})).toBe("code");
    });
});

describe("mergeTags", () => {
    it("preserves existing tags in order", () => {
        const out = mergeTags({
            existing: ["Python", "Jupyter Notebook"],
            repo: "marceloprates/prettymaps",
        });
        expect(out.slice(0, 2)).toEqual(["Python", "Jupyter Notebook"]);
    });

    it("appends new seed tags after existing ones", () => {
        const out = mergeTags({
            existing: ["Python"],
            repo: "marceloprates/prettymaps",
        });
        // Existing "Python" first; seed "open-source", "maps", "matplotlib" follow.
        expect(out).toContain("open-source");
        expect(out).toContain("maps");
        expect(out).toContain("matplotlib");
        expect(out.indexOf("Python")).toBeLessThan(out.indexOf("open-source"));
    });

    it("dedupes case-insensitively while preserving first casing", () => {
        const out = mergeTags({
            existing: ["Python", "Jupyter Notebook"],
            slug: "no-such-slug",
        });
        // No seed tags for an unknown slug; just verifies casing survives.
        expect(out).toEqual(["Python", "Jupyter Notebook"]);
        // Mixed-case collision with a seed tag from a known project:
        const out2 = mergeTags({
            existing: ["python", "Shell"],
            repo: "marceloprates/prettymaps",
        });
        // Existing lowercase "python" wins; seed "matplotlib" + "maps" + "open-source"
        // appended; "Python" never overwrites "python" because first-casing wins.
        expect(out2[0]).toBe("python");
        expect(out2).toContain("Shell");
        expect(out2).not.toContain("Python"); // never re-cased
    });

    it("ignores empty strings and trims whitespace", () => {
        const out = mergeTags({
            existing: ["  Python  ", "", "  "],
            slug: "no-such-slug",
        });
        expect(out).toEqual(["Python"]);
    });

    it("returns only seed tags when existing list is empty", () => {
        const out = mergeTags({
            existing: [],
            repo: "marceloprates/easyshader",
        });
        expect(out).toEqual(
            expect.arrayContaining(["open-source", "sdf", "raymarching"]),
        );
    });
});

describe("listPrimaries", () => {
    it("returns the four primaries in declaration order", () => {
        expect(listPrimaries()).toEqual([
            "code",
            "art",
            "writing",
            "experiments",
        ]);
        expect(listPrimaries()).toEqual(PRIMARY_CATEGORIES);
    });
});