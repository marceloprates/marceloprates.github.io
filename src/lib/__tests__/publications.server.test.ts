import { describe, expect, it, vi } from "vitest";
import fs from "fs";
import os from "os";
import path from "path";
import { fetchPublications } from "../publications.server";

function makeTmpWith(content: object | string): string {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pubs-test-"));
	const dataDir = path.join(dir, "data");
	fs.mkdirSync(dataDir, { recursive: true });
	const filePath = path.join(dataDir, "publications.scholar.json");
	fs.writeFileSync(filePath, typeof content === "string" ? content : JSON.stringify(content));
	return dir;
}

describe("fetchPublications", () => {
	it("reads publications from data/publications.scholar.json", async () => {
		const dir = makeTmpWith({
			publications: [
				{ title: "A", venue: "v", year: 2020, url: "u", citations: 5 },
				{ title: "B", venue: "v", year: 2021, url: "u", citations: 10 },
			],
		});
		const pubs = await fetchPublications({ cwd: dir });
		expect(pubs).toHaveLength(2);
		expect(pubs.map((p) => p.title)).toEqual(["B", "A"]); // sorted desc by citations
	});

	it("sorts by citations descending", async () => {
		const dir = makeTmpWith({
			publications: [
				{ title: "low", venue: "v", year: 2020, url: "u", citations: 1 },
				{ title: "high", venue: "v", year: 2020, url: "u", citations: 100 },
				{ title: "mid", venue: "v", year: 2020, url: "u", citations: 10 },
			],
		});
		const pubs = await fetchPublications({ cwd: dir });
		expect(pubs.map((p) => p.title)).toEqual(["high", "mid", "low"]);
	});

	it("respects max limit", async () => {
		const dir = makeTmpWith({
			publications: Array.from({ length: 20 }, (_, i) => ({
				title: `p${i}`,
				venue: "v",
				year: 2020,
				url: "u",
				citations: 20 - i,
			})),
		});
		const pubs = await fetchPublications({ cwd: dir, max: 5 });
		expect(pubs).toHaveLength(5);
		expect(pubs[0].title).toBe("p0"); // highest citations
	});

	it("prefers citationsUpdated over googleScholarCitations", async () => {
		const dir = makeTmpWith({
			publications: [
				{
					title: "x",
					venue: "v",
					year: 2020,
					url: "u",
					citations: 1,
					googleScholarCitations: 100,
					citationsUpdated: 50,
				},
			],
		});
		const pubs = await fetchPublications({ cwd: dir });
		expect(pubs[0].citations).toBe(50);
	});

	it("falls back to googleScholarCitations if no citationsUpdated", async () => {
		const dir = makeTmpWith({
			publications: [
				{
					title: "x",
					venue: "v",
					year: 2020,
					url: "u",
					citations: 1,
					googleScholarCitations: 100,
				},
			],
		});
		const pubs = await fetchPublications({ cwd: dir });
		expect(pubs[0].citations).toBe(100);
	});

	it("falls back to citations if neither updated nor GS exists", async () => {
		const dir = makeTmpWith({
			publications: [{ title: "x", venue: "v", year: 2020, url: "u", citations: 7 }],
		});
		const pubs = await fetchPublications({ cwd: dir });
		expect(pubs[0].citations).toBe(7);
	});

	it("loud-warns and returns [] when file is missing", async () => {
		const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pubs-test-"));
		const pubs = await fetchPublications({ cwd: dir });
		expect(pubs).toEqual([]);
		expect(warnSpy).toHaveBeenCalledOnce();
		expect(warnSpy.mock.calls[0][0]).toMatch(/failed to read.*publications\.scholar\.json/);
		warnSpy.mockRestore();
	});

	it("loud-warns and returns [] when JSON is malformed", async () => {
		const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
		const dir = makeTmpWith("{not valid json");
		const pubs = await fetchPublications({ cwd: dir });
		expect(pubs).toEqual([]);
		expect(warnSpy).toHaveBeenCalledOnce();
		warnSpy.mockRestore();
	});

	it("treats missing publications array as empty", async () => {
		const dir = makeTmpWith({ notPublications: [] });
		const pubs = await fetchPublications({ cwd: dir });
		expect(pubs).toEqual([]);
	});

	it("coerces non-string fields to safe defaults", async () => {
		const dir = makeTmpWith({
			publications: [{ title: 42, year: "2024" }],
		});
		const pubs = await fetchPublications({ cwd: dir });
		expect(pubs).toHaveLength(1);
		expect(pubs[0].title).toBe("42");
		expect(pubs[0].venue).toBe(""); // null venue → empty string
		expect(pubs[0].year).toBe(2024);
		expect(pubs[0].url).toBe(""); // missing url → empty string
		expect(pubs[0].citations).toBe(0);
	});
});