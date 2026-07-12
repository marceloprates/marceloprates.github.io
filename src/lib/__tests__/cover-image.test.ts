import { describe, expect, it } from "vitest";
import { resolveCoverImage, slugFromFilename } from "../cover-image";

describe("resolveCoverImage", () => {
    it("returns the cover: frontmatter when present and non-empty", () => {
        const meta = { cover: "https://example.com/cover.png" };
        expect(resolveCoverImage(meta, "")).toBe("https://example.com/cover.png");
    });

    it("falls back to <img src> in the excerpt when cover is undefined", () => {
        const meta = { title: "no-cover" };
        const excerpt = "<img src='https://example.com/fallback.jpg'>";
        expect(resolveCoverImage(meta, excerpt)).toBe("https://example.com/fallback.jpg");
    });

    it("falls back when cover is the empty string", () => {
        const meta = { title: "empty-cover", cover: "" };
        const excerpt = "<img src='https://example.com/fallback.jpg'>";
        expect(resolveCoverImage(meta, excerpt)).toBe("https://example.com/fallback.jpg");
    });

    it("falls back when cover is a non-string (number, boolean)", () => {
        const cases = [{ cover: 42 }, { cover: true }, { cover: null }];
        for (const meta of cases) {
            const excerpt = "<img src='https://example.com/x.jpg'>";
            expect(resolveCoverImage(meta, excerpt)).toBe("https://example.com/x.jpg");
        }
    });

    it("returns undefined when neither cover nor excerpt <img> is present", () => {
        expect(resolveCoverImage({}, "")).toBeUndefined();
        expect(resolveCoverImage({ title: "no-cover" }, "Plain text excerpt.")).toBeUndefined();
    });

    it("preserves exact cover URL string (no trailing-slash normalization)", () => {
        const meta = { cover: "https://example.com/cover.png/" };
        expect(resolveCoverImage(meta, "")).toBe("https://example.com/cover.png/");
    });
});

describe("slugFromFilename", () => {
    it("strips .md extension", () => {
        expect(slugFromFilename("easyshader.md")).toBe("easyshader");
    });

    it("strips .markdown extension (case-insensitive)", () => {
        expect(slugFromFilename("Foo.Markdown")).toBe("Foo");
        expect(slugFromFilename("bar.MD")).toBe("bar");
    });

    it("strips leading YYYY-MM-DD- date prefix", () => {
        expect(slugFromFilename("2024-03-17-ia-no-significa-nada.md")).toBe("ia-no-significa-nada");
    });

    it("strips .mdx extension", () => {
        expect(slugFromFilename("mypost.mdx")).toBe("mypost");
    });

    it("preserves dashes inside the slug (does NOT collapse them)", () => {
        expect(slugFromFilename("cosmos---a-sketch.md")).toBe("cosmos---a-sketch");
    });

    it("returns an empty string for empty input", () => {
        expect(slugFromFilename("")).toBe("");
    });
});
