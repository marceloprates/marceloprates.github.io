/**
 * Tests for getWorkProjects().
 *
 * Strategy: mock @/lib/content so the markdown source can be
 * controlled without touching the filesystem. The GitHub source
 * (src/data/projects.ts) is the real fixture (six projects that
 * are committed and won't change mid-iteration).
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/content", () => ({
    getAllProjects: vi.fn(),
    getPostBySlug: vi.fn(),
    getProjectBySlug: vi.fn(),
}));

import * as contentModule from "@/lib/content";
import { getWorkProjects } from "@/lib/work-projects";
import type { ProjectMeta } from "@/data/project-schema";

const getAllProjects = contentModule.getAllProjects as unknown as ReturnType<typeof vi.fn>;

const fixtureMarkdown = (overrides: Partial<ProjectMeta>): ProjectMeta =>
    ({
        title: "Untitled",
        tags: [],
        excerpt: "",
        slug: "untitled",
        ...overrides,
    }) as ProjectMeta;

describe("getWorkProjects", () => {
    beforeEach(() => {
        getAllProjects.mockReturnValue([]);
    });
    afterEach(() => {
        vi.clearAllMocks();
    });

    it("returns all six GitHub-sourced projects when no markdown exists", () => {
        const out = getWorkProjects();
        expect(out).toHaveLength(6);
        // Spot-check: every record carries a primary.
        for (const p of out) {
            expect(p.primary).toMatch(/^(code|art|writing|experiments)$/);
        }
        // Spot-check: prettymaps is `art` per the seed.
        const prettymaps = out.find((p) => p.repo === "marceloprates/prettymaps");
        expect(prettymaps?.primary).toBe("art");
    });

    it("merges seed tags onto GitHub projects", () => {
        const out = getWorkProjects();
        const prettymaps = out.find((p) => p.repo === "marceloprates/prettymaps");
        // Existing GitHub tags first; seed "open-source", "maps",
        // "matplotlib" appended in that order; case-preserved.
        expect(prettymaps?.tags).toEqual(
            expect.arrayContaining(["Jupyter Notebook", "Python", "Shell"]),
        );
        expect(prettymaps?.tags).toEqual(
            expect.arrayContaining(["open-source", "maps", "matplotlib"]),
        );
    });

    it("dedupes markdown projects that share a GitHub repo slug", () => {
        // A markdown project whose slug matches GitHub `repo`'s second segment.
        // Should be suppressed in favour of the GitHub card.
        getAllProjects.mockReturnValue([
            fixtureMarkdown({
                title: "Prettymaps (alt)",
                slug: "prettymaps",
                excerpt: "alternate description",
                tags: ["python"],
            }),
            fixtureMarkdown({
                title: "Easyshader (alt)",
                slug: "easyshader",
                excerpt: "alternate description",
                tags: [],
            }),
        ]);

        const out = getWorkProjects();
        // Two markdown shadows were dropped, so still six records.
        expect(out).toHaveLength(6);
        // Original titles preserved.
        const titles = out.map((p) => p.title);
        expect(titles).toContain("prettymaps");
        expect(titles).not.toContain("Prettymaps (alt)");
        expect(titles).not.toContain("Easyshader (alt)");
    });

    it("dedupes markdown projects whose title matches a GitHub project (case-insensitive)", () => {
        getAllProjects.mockReturnValue([
            fixtureMarkdown({
                title: "PRETTYMAPS",
                slug: "prettymaps-alt",
                excerpt: "double alt",
            }),
        ]);

        const out = getWorkProjects();
        // Title match ("PRETTYMAPS" vs "prettymaps") suppresses the dupe.
        expect(out).toHaveLength(6);
        expect(out.find((p) => p.title === "PRETTYMAPS")).toBeUndefined();
    });

    it("includes a markdown-only project that doesn't duplicate anything", () => {
        getAllProjects.mockReturnValue([
            fixtureMarkdown({
                title: "Streamlines",
                slug: "streamlines",
                excerpt: "A pure-markdown project for testing.",
                tags: ["art", "wip"],
                image: "/images/projects/streamlines/cover.png",
            }),
        ]);

        const out = getWorkProjects();
        // 6 GitHub + 1 markdown = 7.
        expect(out).toHaveLength(7);
        const streamlines = out.find((p) => p.title === "Streamlines");
        expect(streamlines).toBeDefined();
        expect(streamlines?.link).toBe("/projects/streamlines");
        expect(streamlines?.image).toBe("/images/projects/streamlines/cover.png");
        // No repo → assignPrimary falls back to "code"; mergeTags keeps existing tags.
        expect(streamlines?.primary).toBe("code");
        expect(streamlines?.tags).toEqual(["art", "wip"]);
    });

    it("handles an empty markdown source cleanly", () => {
        getAllProjects.mockReturnValue([]);
        const out = getWorkProjects();
        expect(out).toHaveLength(6);
    });
});
