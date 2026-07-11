import { describe, it, expect } from "vitest";
import { defaultRemarkPlugins, defaultRehypePlugins } from "./markdown-config";

describe("markdown-config exports", () => {
    it("defaultRemarkPlugins is a non-empty array of plugins", () => {
        expect(Array.isArray(defaultRemarkPlugins)).toBe(true);
        expect(defaultRemarkPlugins.length).toBeGreaterThan(0);
        expect(defaultRemarkPlugins.length).toBe(2); // remarkMath + remarkGfm
    });

    it("defaultRehypePlugins is a non-empty array of plugins", () => {
        expect(Array.isArray(defaultRehypePlugins)).toBe(true);
        expect(defaultRehypePlugins.length).toBeGreaterThan(0);
        expect(defaultRehypePlugins.length).toBe(2); // rehypeRaw + rehypeKatex
    });

    it("plugin entries are functions or [function, options] tuples", () => {
        const isPlugin = (p: unknown) =>
            typeof p === "function" ||
            (Array.isArray(p) && typeof p[0] === "function");
        [...defaultRemarkPlugins, ...defaultRehypePlugins].forEach((p) => {
            expect(isPlugin(p)).toBe(true);
        });
    });
});
