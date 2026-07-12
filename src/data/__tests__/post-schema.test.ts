import { describe, expect, it } from "vitest";
import { PostFrontmatterSchema } from "../post-schema";

describe("PostFrontmatterSchema", () => {
    const valid = { title: "IA não significa nada" };

    it("accepts a minimal entry with only the required title", () => {
        expect(PostFrontmatterSchema.safeParse(valid).success).toBe(true);
    });

    it("accepts a complete entry with cover, date, tags, original_path", () => {
        const complete = {
            title: "IA não significa nada",
            cover: "https://upload.wikimedia.org/wikipedia/commons/a/ab/Armillaria_ostoyae.jpg",
            excerpt: "<img src='https://upload.wikimedia.org/...jpg'>",
            date: "2024-03-17",
            tags: [],
            categories: [],
            original_path: "_posts/2024-3-17-IA.md",
        };
        expect(PostFrontmatterSchema.safeParse(complete).success).toBe(true);
    });

    it("accepts a local /images/... path cover", () => {
        const local = {
            title: "local-cover-post",
            cover: "/images/posts/local-cover-post/cover.png",
        };
        expect(PostFrontmatterSchema.safeParse(local).success).toBe(true);
    });

    it("accepts an empty-string cover as absent (fallback to excerpt-img)", () => {
        // Empty string is intentionally allowed-but-empty rather than
        // rejected: getAllPosts() treats "" the same as undefined and
        // falls back to the excerpt's <img src>.
        expect(PostFrontmatterSchema.safeParse({ ...valid, cover: "" }).success).toBe(true);
    });

    it("rejects an empty or missing title", () => {
        expect(PostFrontmatterSchema.safeParse({}).success).toBe(false);
        expect(PostFrontmatterSchema.safeParse({ title: "" }).success).toBe(false);
    });

    it("preserves unknown frontmatter fields via passthrough", () => {
        const withExtras = {
            ...valid,
            // Real-world post frontmatter often has blog-import cruft:
            legacyId: "wp-12345",
            pinned: true,
            styleNotes: { background: "light", font: "serif" },
        };
        const result = PostFrontmatterSchema.parse(withExtras);
        expect(result.legacyId).toBe("wp-12345");
        expect(result.pinned).toBe(true);
        expect(result.styleNotes).toEqual({ background: "light", font: "serif" });
    });
});
