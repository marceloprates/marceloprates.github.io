import { describe, expect, it } from "vitest";
import { stripHtml } from "../excerpt";

describe("stripHtml", () => {
    it("returns empty string for empty / undefined-ish input", () => {
        expect(stripHtml("")).toBe("");
    });

    it("returns plain text unchanged", () => {
        const text = "An edited, modernized LaTeX edition.";
        expect(stripHtml(text)).toBe(text);
    });

    it("removes a leading <img> tag entirely (used by IA post excerpt)", () => {
        const html = "<img src='https://upload.wikimedia.org/wikipedia/commons/a/ab/Armillaria_ostoyae.jpg'>";
        expect(stripHtml(html)).toBe("");
    });

    it("strips inline tags like <strong> while keeping text content", () => {
        expect(stripHtml("Hello <strong>world</strong>!")).toBe("Hello world!");
    });

    it("collapses multi-line whitespace into a single space", () => {
        expect(stripHtml("<p>line 1</p>\n\n<p>line 2</p>")).toBe("line 1 line 2");
    });

    it("removes self-closing tags like <br/>", () => {
        expect(stripHtml("before<br/>after")).toBe("beforeafter");
    });

    it("removes tags with double-quoted attributes and trailing slash", () => {
        expect(stripHtml(`<img src="/x.png" alt="hi" />`)).toBe("");
    });
});
