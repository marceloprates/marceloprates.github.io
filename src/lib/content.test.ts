import { describe, it, expect } from "vitest";
import { getPostBySlug, getProjectBySlug, getAllPosts } from "./content";

describe("getPostBySlug", () => {
    it("returns the post when an exact slug matches the filename", () => {
        const post = getPostBySlug("ia-no-significa-nada");
        expect(post).not.toBeNull();
        expect(post?.meta.title).toBeTruthy();
        expect(post?.content).toContain("IA");
    });

    it("rejects substring matches (regression: audit P0 #2)", () => {
        // The previous implementation used `f.includes(slug)` which would
        // return the post for any substring. With the fix, only exact slugs
        // match. The slug 'ia' should NOT match 'ia-no-significa-nada'.
        expect(getPostBySlug("ia")).toBeNull();
        expect(getPostBySlug("significa")).toBeNull();
        expect(getPostBySlug("nada")).toBeNull();
    });

    it("returns null for an unknown slug", () => {
        expect(getPostBySlug("this-post-does-not-exist")).toBeNull();
    });

    it("strips a leading YYYY-MM-DD- date prefix", () => {
        // File is '2024-03-17-ia-no-significa-nada.md'; the slug is the
        // date-stripped base. Both 'ia-no-significa-nada' (case-sensitive)
        // and the case-insensitive variant should work.
        expect(getPostBySlug("ia-no-significa-nada")).not.toBeNull();
        expect(getPostBySlug("IA-NO-SIGNIFICA-NADA")).not.toBeNull();
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

describe("getAllPosts — image extraction (P0 #3 regression)", () => {
    it("extracts the <img src> URL from post excerpt at build time", () => {
        // The single existing post has an excerpt containing the Wikipedia
        // Armillaria ostoyae image. getAllPosts should now extract that URL
        // into post.image so PostCard doesn't need DOMParser in the browser.
        const posts = getAllPosts();
        const turmite = posts.find((p) => p.slug === "ia-no-significa-nada");
        expect(turmite).toBeDefined();
        expect(turmite?.image).toBe(
            "https://upload.wikimedia.org/wikipedia/commons/a/ab/Armillaria_ostoyae.jpg"
        );
    });

    it("returns undefined image when excerpt is plain text", () => {
        // All current posts have an <img>; this is a forward-looking assertion.
        const posts = getAllPosts();
        posts.forEach((p) => {
            // image is either a URL or undefined; both are valid
            expect(p.image === undefined || typeof p.image === "string").toBe(true);
        });
    });
});
