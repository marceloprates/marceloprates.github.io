import { describe, it, expect, vi } from "vitest";
import fs from "fs";

// Mirror the structure of fetchPublications from src/app/page.tsx so we can
// unit-test the error-handling behavior in isolation.

function loudFetchPublications(pubsPath: string, max = 9): unknown[] {
    try {
        const raw = fs.readFileSync(pubsPath, "utf8");
        const data = JSON.parse(raw || "{}");
        const pubs: unknown[] = Array.isArray(data.publications) ? data.publications : [];
        return pubs.slice(0, max);
    } catch (err) {
        // Mirrors the P0 #4 fix in src/app/page.tsx
        console.warn(
            `[fetchPublications] failed to read ${pubsPath}: ${
                err instanceof Error ? err.message : String(err)
            }. Run 'npm run fetch-scholar' to populate.`,
        );
        return [];
    }
}

describe("fetchPublications loud failure (P0 #4 regression)", () => {
    it("warns loudly when the file is missing", () => {
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
        const result = loudFetchPublications("/tmp/does-not-exist-marcelo-test.json");
        expect(result).toEqual([]);
        expect(warnSpy).toHaveBeenCalledOnce();
        expect(warnSpy.mock.calls[0][0]).toMatch(/failed to read.*does-not-exist-marcelo-test\.json/);
        expect(warnSpy.mock.calls[0][0]).toMatch(/Run 'npm run fetch-scholar'/);
        warnSpy.mockRestore();
    });

    it("returns empty array without throwing on invalid JSON", () => {
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
        const tmpPath = "/tmp/publications-invalid-marcelo-test.json";
        fs.writeFileSync(tmpPath, "not json");
        const result = loudFetchPublications(tmpPath);
        expect(result).toEqual([]);
        expect(warnSpy).toHaveBeenCalledOnce();
        warnSpy.mockRestore();
        fs.unlinkSync(tmpPath);
    });

    it("returns parsed publications when file is valid", () => {
        const tmpPath = "/tmp/publications-valid-marcelo-test.json";
        fs.writeFileSync(tmpPath, JSON.stringify({ publications: [{ title: "X" }] }));
        const result = loudFetchPublications(tmpPath);
        expect(result).toEqual([{ title: "X" }]);
        fs.unlinkSync(tmpPath);
    });
});
