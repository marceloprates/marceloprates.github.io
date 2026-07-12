import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/portfolio-scan", () => ({
    loadPortfolioDecisions: vi.fn(() => ({})),
}));

import * as portfolioScan from "@/lib/portfolio-scan";
import { buildPortfolioWorkProjects } from "@/lib/work-projects";
import type { PortfolioBodyRecord } from "@/lib/content";
import type { PortfolioDecisions } from "@/lib/portfolio-scan";

const loadPortfolioDecisions = portfolioScan.loadPortfolioDecisions as unknown as ReturnType<typeof vi.fn>;

const mkRecord = (overrides: {
    slug?: string;
    owner?: string;
    name?: string;
    visibility?: "public" | "private";
    stars?: number;
    frontmatter?: Record<string, unknown>;
    content?: string;
}): PortfolioBodyRecord => ({
    slug: overrides.slug ?? "alpha",
    filePath: `/tmp/portfolio-bodies/${overrides.owner ?? "marceloprates"}-${overrides.name ?? "alpha"}/portfolio.md`,
    frontmatter: overrides.frontmatter ?? { include: true },
    content: overrides.content ?? "# Alpha\n\nBody paragraph one.\n\nMore body.",
    sidecar: {
        owner: overrides.owner ?? "marceloprates",
        name: overrides.name ?? "alpha",
        visibility: overrides.visibility ?? "private",
        defaultBranch: "main",
        stars: overrides.stars ?? 0,
    },
});

describe("buildPortfolioWorkProjects (pure)", () => {
    it("returns an empty array for empty input", () => {
        expect(buildPortfolioWorkProjects([], {})).toEqual([]);
    });

    it("converts a private body to a WorkProject with private: true", () => {
        const projects = buildPortfolioWorkProjects(
            [
                mkRecord({
                    visibility: "private",
                    content: "No heading, just body for testing.",
                }),
            ],
            {},
        );
        expect(projects).toHaveLength(1);
        expect(projects[0].private).toBe(true);
        expect(projects[0].repo).toBe("marceloprates/alpha");
        expect(projects[0].link).toBe("/projects/alpha");
        expect(projects[0].title).toBe("alpha");
    });

    it("does NOT set private on a public-visibility body", () => {
        const projects = buildPortfolioWorkProjects(
            [mkRecord({ visibility: "public" })],
            {},
        );
        expect(projects[0].private).toBeUndefined();
    });

    it("uses frontmatter title when present", () => {
        const projects = buildPortfolioWorkProjects(
            [
                mkRecord({
                    frontmatter: { include: true, title: "My Explicit Title" },
                }),
            ],
            {},
        );
        expect(projects[0].title).toBe("My Explicit Title");
    });

    it("falls back to H1 then slug for title", () => {
        const a = buildPortfolioWorkProjects(
            [mkRecord({ content: "# H1 Title\n\nBody." })],
            {},
        );
        expect(a[0].title).toBe("H1 Title");
        const b = buildPortfolioWorkProjects(
            [mkRecord({ content: "No heading here, just body." })],
            {},
        );
        expect(b[0].title).toBe("alpha");
    });

    it("uses frontmatter summary as desc", () => {
        const projects = buildPortfolioWorkProjects(
            [
                mkRecord({
                    frontmatter: {
                        include: true,
                        summary: "A pitch from frontmatter.",
                    },
                }),
            ],
            {},
        );
        expect(projects[0].desc).toBe("A pitch from frontmatter.");
    });

    it("falls back to first prose paragraph when no summary", () => {
        const projects = buildPortfolioWorkProjects(
            [
                mkRecord({
                    content:
                        "# Heading\n\nFirst real paragraph here.\n\nSecond one too.",
                    frontmatter: { include: true },
                }),
            ],
            {},
        );
        expect(projects[0].desc).toBe("First real paragraph here.");
    });

    it("uses frontmatter tags", () => {
        const projects = buildPortfolioWorkProjects(
            [
                mkRecord({
                    frontmatter: { include: true, tags: ["python", "llm"] },
                }),
            ],
            {},
        );
        expect(projects[0].tags).toEqual(["python", "llm"]);
    });

    it("falls back to empty tags when none in frontmatter", () => {
        const projects = buildPortfolioWorkProjects(
            [mkRecord({ frontmatter: { include: true } })],
            {},
        );
        expect(projects[0].tags).toEqual([]);
    });

    it("uses frontmatter cover as image", () => {
        const projects = buildPortfolioWorkProjects(
            [
                mkRecord({
                    frontmatter: { include: true, cover: "docs/cover.png" },
                }),
            ],
            {},
        );
        expect(projects[0].image).toBe("docs/cover.png");
    });

    it("propagates stars from sidecar", () => {
        const projects = buildPortfolioWorkProjects(
            [mkRecord({ stars: 42 })],
            {},
        );
        expect(projects[0].stars).toBe(42);
    });

    it("uses explicit frontmatter primary when present", () => {
        const projects = buildPortfolioWorkProjects(
            [
                mkRecord({
                    frontmatter: { include: true, primary: "art" },
                }),
            ],
            {},
        );
        expect(projects[0].primary).toBe("art");
    });

    it("respects decisions: include: false (skips the record)", () => {
        const decisions: PortfolioDecisions = {
            "marceloprates/alpha": { include: false },
        };
        expect(buildPortfolioWorkProjects([mkRecord({})], decisions)).toEqual([]);
    });

    it("decisions override.summary wins over frontmatter summary", () => {
        const decisions: PortfolioDecisions = {
            "marceloprates/alpha": { override: { summary: "Decision summary." } },
        };
        const projects = buildPortfolioWorkProjects(
            [
                mkRecord({
                    frontmatter: { include: true, summary: "Frontmatter summary." },
                }),
            ],
            decisions,
        );
        expect(projects[0].desc).toBe("Decision summary.");
    });

    it("decisions override.tags wins over frontmatter tags", () => {
        const decisions: PortfolioDecisions = {
            "marceloprates/alpha": { override: { tags: ["override"] } },
        };
        const projects = buildPortfolioWorkProjects(
            [
                mkRecord({
                    frontmatter: { include: true, tags: ["from-fm"] },
                }),
            ],
            decisions,
        );
        expect(projects[0].tags).toEqual(["override"]);
    });

    it("decisions override.cover wins over frontmatter cover", () => {
        const decisions: PortfolioDecisions = {
            "marceloprates/alpha": { override: { cover: "decision.png" } },
        };
        const projects = buildPortfolioWorkProjects(
            [
                mkRecord({
                    frontmatter: { include: true, cover: "fm.png" },
                }),
            ],
            decisions,
        );
        expect(projects[0].image).toBe("decision.png");
    });

    it("decisions override.primary wins over frontmatter primary", () => {
        const decisions: PortfolioDecisions = {
            "marceloprates/alpha": { override: { primary: "writing" } },
        };
        const projects = buildPortfolioWorkProjects(
            [
                mkRecord({
                    frontmatter: { include: true, primary: "art" },
                }),
            ],
            decisions,
        );
        expect(projects[0].primary).toBe("writing");
    });

    it("decisions override.slug changes the link", () => {
        const decisions: PortfolioDecisions = {
            "marceloprates/alpha": { override: { slug: "renamed" } },
        };
        const projects = buildPortfolioWorkProjects(
            [mkRecord({ slug: "alpha" })],
            decisions,
        );
        expect(projects[0].link).toBe("/projects/renamed");
    });

    it("handles multiple records", () => {
        const projects = buildPortfolioWorkProjects(
            [
                mkRecord({ slug: "alpha", owner: "o1", name: "alpha" }),
                mkRecord({ slug: "beta", owner: "o1", name: "beta" }),
                mkRecord({
                    slug: "gamma",
                    owner: "o2",
                    name: "gamma",
                    visibility: "public",
                }),
            ],
            {},
        );
        expect(projects).toHaveLength(3);
        expect(projects.map((p) => p.repo).sort()).toEqual([
            "o1/alpha",
            "o1/beta",
            "o2/gamma",
        ]);
    });

    it("link is always /projects/<slug>", () => {
        const projects = buildPortfolioWorkProjects(
            [mkRecord({ slug: "anything" })],
            {},
        );
        expect(projects[0].link).toBe("/projects/anything");
    });
});

describe("getWorkProjects (portfolio merge integration)", () => {
    it("does not throw when portfolio-bodies/ doesn't exist", async () => {
        loadPortfolioDecisions.mockReturnValue({});
        const { getWorkProjects } = await import("@/lib/work-projects");
        const projects = getWorkProjects();
        // Without fixture bodies, only GitHub + markdown + Starship should
        // be in the list. We don't assert exact count (real content
        // changes over time) — just that no private portfolio entries
        // sneak in.
        const privateFromPortfolio = projects.filter(
            (p) => p.private === true && p.repo?.includes("/"),
        );
        // None should come from portfolio-bodies (empty in this test).
        expect(privateFromPortfolio).toEqual([]);
    });
});
