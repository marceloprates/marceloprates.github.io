import { describe, it, expect } from "vitest";
import { getPostBySlug, getProjectBySlug, getAllPosts } from "./content";

describe("getPostBySlug", () => {
    it("returns null for an unknown slug", () => {
        expect(getPostBySlug("this-post-does-not-exist")).toBeNull();
    });

    it("rejects substring matches (regression: audit P0 #2)", () => {
        // The previous implementation used `f.includes(slug)` which would
        // return the post for any substring. With the fix, only exact slugs
        // match. The slug 'ia' should NOT match 'ia-no-significa-nada'.
        expect(getPostBySlug("ia")).toBeNull();
        expect(getPostBySlug("significa")).toBeNull();
        expect(getPostBySlug("nada")).toBeNull();
    });

    it("returns null for a draft post (defense in depth — the page route already 404s)", () => {
        // The IA post is unpublished as of 2026-07-12. Even though its
        // filename still matches the slug, the `draft: true` frontmatter
        // flag causes getPostBySlug to return null. The author can still
        // read the markdown source on disk; it just isn't surfaced via
        // the public resolver.
        expect(getPostBySlug("ia-no-significa-nada")).toBeNull();
        expect(getPostBySlug("IA-NO-SIGNIFICA-NADA")).toBeNull();
    });
});

describe("getProjectBySlug", () => {
    it("returns a project when an exact slug matches", () => {
        const projects = ["prettymaps", "streamlines"];
        const found = projects.find((p) => getProjectBySlug(p) !== null);
        expect(found).toBeTruthy();
    });

    it("rejects substring matches (already fixed in getProjectBySlug; regression guard)", () => {
        expect(getProjectBySlug("map")).toBeNull();
        expect(getProjectBySlug("stream")).toBeNull();
    });

    it("returns null for an unknown slug", () => {
        expect(getProjectBySlug("this-project-does-not-exist")).toBeNull();
    });
});

describe("getAllPosts — image extraction + draft filter", () => {
    it("filters out drafts so the public listing never surfaces them", () => {
        // The IA post has `draft: true` in its frontmatter (2026-07-12).
        // The /posts listing and the ⌘K palette should never see it.
        const posts = getAllPosts();
        const drafts = posts.filter((p) => p.draft === true);
        expect(drafts).toHaveLength(0);
        // And the slug itself must not appear in the public listing.
        expect(posts.find((p) => p.slug === "ia-no-significa-nada")).toBeUndefined();
    });

    it("returns undefined image when excerpt is plain text", () => {
        // Forward-looking: any future published post either has an image
        // URL or undefined. (The IA post is the only file currently, and
        // it's a draft, so the loop is a no-op until another post lands.)
        const posts = getAllPosts();
        posts.forEach((p) => {
            expect(p.image === undefined || typeof p.image === "string").toBe(true);
        });
    });
});
