/**
 * Tests for getSearchItems() — the Server Component reader.
 *
 * Strategy: the script (scripts/build-search-index.ts) writes a
 * known fixture to public/search-index.json during build. We
 * invoke getSearchItems() against that fixture and assert shape.
 *
 * If the JSON is missing (e.g., on a fresh clone before `npm run
 * build:search-index`), getSearchItems() throws — and that's the
 * correct failure mode.
 */

import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";
import { getSearchItems } from "@/lib/search-items.server";

const INDEX_PATH = path.join(process.cwd(), "public", "search-index.json");

describe("getSearchItems", () => {
    it("returns a non-empty array of SearchableItems from the index", () => {
        const items = getSearchItems();
        expect(Array.isArray(items)).toBe(true);
        expect(items.length).toBeGreaterThan(0);
        // Spot-check shape.
        const first = items[0];
        expect(first).toHaveProperty("id");
        expect(first).toHaveProperty("title");
        expect(first).toHaveProperty("href");
        expect(first).toHaveProperty("type");
    });

    it("includes a project item for the well-known prettymaps repo", () => {
        const items = getSearchItems();
        const prettymaps = items.find((i) => i.id === "project:marceloprates/prettymaps");
        expect(prettymaps).toBeDefined();
        expect(prettymaps?.title).toBe("prettymaps");
        expect(prettymaps?.href).toContain("prettymaps");
        expect(prettymaps?.type).toBe("project");
    });

    it("includes the locked top-level pages", () => {
        const items = getSearchItems();
        for (const p of ["/projects", "/posts", "/about", "/resume", "/misc"]) {
            const page = items.find((i) => i.id === `page:${p}`);
            expect(page, `missing page entry for ${p}`).toBeDefined();
            expect(page?.type).toBe("page");
        }
    });

    it("returns at least one post item (content/posts/ has IA post)", () => {
        const items = getSearchItems();
        const posts = items.filter((i) => i.type === "post");
        expect(posts.length).toBeGreaterThan(0);
    });

    it("throws a clear error when the index file is missing", () => {
        // Move the JSON aside, call getSearchItems, expect throw,
        // then restore it.
        if (!fs.existsSync(INDEX_PATH)) return; // nothing to test
        const backup = fs.readFileSync(INDEX_PATH);
        fs.unlinkSync(INDEX_PATH);
        try {
            expect(() => getSearchItems()).toThrow(/search-index\.json/);
        } finally {
            fs.writeFileSync(INDEX_PATH, backup);
        }
    });
});
