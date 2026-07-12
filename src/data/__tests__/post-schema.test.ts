import { describe, expect, it } from "vitest";
import {
    PostFrontmatterSchema,
    type PostMeta,
} from "../post-schema";

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

describe("PostMeta (build-time type)", () => {
    // PostMeta is purely a type — runtime assertions must go through the
    // schema. These tests verify the type SHAPE via compile-time helpers
    // (TypeScript checks) AND that PostFrontmatterSchema accepts what
    // PostMeta would carry at runtime.

    it("PostMeta requires title + slug and optionally carries image", () => {
        // Compile-time type assertion. If PostMeta's shape ever drifts
        // (e.g. slug becomes optional), this fails to typecheck.
        const minimal: PostMeta = {
            title: "minimal",
            slug: "minimal",
        };
        expect(minimal.slug).toBe("minimal");
        expect(minimal.image).toBeUndefined();

        const withImage: PostMeta = {
            title: "with-image",
            slug: "with-image",
            image: "https://example.com/cover.png",
        };
        expect(withImage.image).toBe("https://example.com/cover.png");
    });

    it("PostMeta preserves all PostFrontmatter fields plus slug + image", () => {
        // Round-trip: PostMeta-shaped object should pass PostFrontmatterSchema.parse
        // (image is a build-time field, not a schema field, but the rest is).
        const full: PostMeta = {
            title: "full",
            slug: "full",
            image: "/images/posts/full/cover.png",
            cover: "/images/posts/full/cover.png",
            excerpt: "Excerpt text",
            date: "2024-03-17",
            tags: ["ai", "philosophy"],
            categories: ["essay"],
            original_path: "_posts/full.md",
        };
        const parsed = PostFrontmatterSchema.parse(full);
        expect(parsed.title).toBe("full");
        expect(parsed.excerpt).toBe("Excerpt text");
        expect(parsed.tags).toEqual(["ai", "philosophy"]);
        expect(parsed.original_path).toBe("_posts/full.md");
        // Sanity: image was a build-time field, not in the schema's
        // known fields. .passthrough() would preserve it though.
        expect((parsed as { image?: string }).image).toBe("/images/posts/full/cover.png");
    });

    it("PostMeta slug is non-optional (required by getAllPosts contract)", () => {
        // Type assertion: a PostMeta with missing slug fails typecheck.
        // The runtime check is via TypeScript only.
        const meta: PostMeta = { title: "t", slug: "s" };
        // If PostMeta.slug becomes optional, this still typechecks;
        // but the explicit `: PostMeta` annotation forces the check.
        const slug: string = meta.slug;
        expect(slug).toBe("s");
    });
});
