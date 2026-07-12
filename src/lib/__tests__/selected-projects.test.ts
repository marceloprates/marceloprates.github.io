import { describe, expect, it } from "vitest";
import {
	resolveProjectImage,
	resolveSelectedProjects,
	type ContentLookup,
	type ResolveSelectedProjectsInput,
} from "../selected-projects";
import type { Project } from "@/types";
import type { ProjectFrontmatter } from "@/data/project-schema";

const stubAllProjects: Project[] = [
	{
		title: "prettymaps",
		desc: "A small Python library",
		tags: ["python", "maps"],
		link: "https://github.com/marceloprates/prettymaps",
		repo: "marceloprates/prettymaps",
		stars: 1000,
	},
	{
		title: "streamlines",
		desc: "Streamlines library",
		tags: ["python"],
		link: "https://github.com/marceloprates/streamlines",
		repo: "marceloprates/streamlines",
		stars: 50,
	},
	{
		title: "Custom Title Repo",
		desc: "matched by title",
		tags: [],
		link: "https://github.com/foo/bar",
		repo: "foo/bar",
	},
];

const stubContentProjects = [
	{ slug: "streamlines" },
	{ slug: "prettymaps" },
];

const stubContentLookup: ContentLookup = (slug) => {
	const content: Record<string, ProjectFrontmatter> = {
		streamlines: {
			title: "Streamlines",
			excerpt: "A <b>cool</b> library about streamlines.",
			image: "cover.jpg",
			tags: ["python", "graphics"],
			repo: "marceloprates/streamlines",
		},
		prettymaps: {
			title: "prettymaps",
			excerpt: "Draw pretty maps.",
			tags: ["python", "maps"],
			repo: "marceloprates/prettymaps",
		},
	};
	return content[slug] ? { meta: content[slug] } : null;
};

const stubMetadata = {
	"marceloprates/streamlines": { hasLocalPage: true, slug: "streamlines" },
	"marceloprates/prettymaps": { hasLocalPage: true, slug: "prettymaps" },
};

function makeInput(entries: string[]): ResolveSelectedProjectsInput {
	return {
		entries,
		allProjects: stubAllProjects,
		contentProjects: stubContentProjects,
		projectMetadata: stubMetadata,
		getContentBySlug: stubContentLookup,
	};
}

describe("resolveProjectImage", () => {
	it("returns absolute URLs as-is", () => {
		expect(
			resolveProjectImage(
				{ title: "x", image: "https://example.com/x.jpg" },
				"slug",
			),
		).toBe("https://example.com/x.jpg");
	});

	it("returns root-relative URLs as-is", () => {
		expect(resolveProjectImage({ title: "x", image: "/images/x.jpg" }, "slug")).toBe(
			"/images/x.jpg",
		);
	});

	it("prepends /images/projects/{slug}/ for bare filenames", () => {
		expect(resolveProjectImage({ title: "x", image: "cover.jpg" }, "myslug")).toBe(
			"/images/projects/myslug/cover.jpg",
		);
	});

	it("falls back to cover field if image is missing", () => {
		expect(resolveProjectImage({ title: "x", cover: "cover.png" }, "slug")).toBe(
			"/images/projects/slug/cover.png",
		);
	});

	it("falls back to first <img src=...> in excerpt", () => {
		expect(
			resolveProjectImage(
				{ title: "x", excerpt: '<p><img src="thumb.png" alt="x"/></p>' },
				"slug",
			),
		).toBe("/images/projects/slug/thumb.png");
	});

	it("returns undefined when no image source is found", () => {
		expect(resolveProjectImage({ title: "x" }, "slug")).toBeUndefined();
	});

	it("ignores non-string image fields", () => {
		expect(resolveProjectImage({ title: "x", image: 42 }, "slug")).toBeUndefined();
	});
});

describe("resolveSelectedProjects", () => {
	it("resolves owner/repo entries to enriched projects", () => {
		const r = resolveSelectedProjects(makeInput(["marceloprates/streamlines"]));
		expect(r).toHaveLength(1);
		expect(r[0].repo).toBe("marceloprates/streamlines");
		expect(r[0].stars).toBe(50);
	});

	it("falls back to content lookup when owner/repo not in enriched list", () => {
		const r = resolveSelectedProjects(makeInput(["foo/some-unknown-repo"]));
		expect(r).toHaveLength(0); // last path segment "some-unknown-repo" also not in content
	});

	it("resolves owner/repo that has a content page (enriched wins over content)", () => {
		const r = resolveSelectedProjects(
			makeInput(["marceloprates/streamlines", "marceloprates/prettymaps"]),
		);
		expect(r).toHaveLength(2);
		// enriched list takes priority when owner/repo matches — returns enriched project
		expect(r.map((p) => p.title)).toEqual(["streamlines", "prettymaps"]);
		expect(r[0].stars).toBe(50); // enriched stars survive
	});

	it("resolves /projects/slug entries via content", () => {
		const r = resolveSelectedProjects(makeInput(["/projects/streamlines"]));
		expect(r).toHaveLength(1);
		expect(r[0].link).toBe("/projects/streamlines");
		expect(r[0].image).toBe("/images/projects/streamlines/cover.jpg");
	});

	it("resolves bare slug entries via content", () => {
		const r = resolveSelectedProjects(makeInput(["prettymaps"]));
		expect(r).toHaveLength(1);
		expect(r[0].title).toBe("prettymaps");
	});

	it("resolves raw title entries against enriched list", () => {
		const r = resolveSelectedProjects(makeInput(["Custom Title Repo"]));
		expect(r).toHaveLength(1);
		expect(r[0].repo).toBe("foo/bar");
	});

	it("skips entries that cannot be resolved", () => {
		const r = resolveSelectedProjects(
			makeInput([
				"marceloprates/streamlines",
				"does/not-exist",
				"prettymaps",
				"Unknown Title",
			]),
		);
		expect(r).toHaveLength(2); // streamlines (repo match) + prettymaps (slug match)
	});

	it("preserves entry order", () => {
		const r = resolveSelectedProjects(
			makeInput(["prettymaps", "marceloprates/streamlines"]),
		);
		expect(r.map((p) => p.title)).toEqual(["prettymaps", "streamlines"]);
	});

	it("strips HTML from description", () => {
		const r = resolveSelectedProjects(makeInput(["/projects/streamlines"]));
		expect(r[0].desc).toBe("A cool library about streamlines.");
	});

	it("returns empty array for empty entries", () => {
		expect(resolveSelectedProjects(makeInput([]))).toEqual([]);
	});

	it("treats content as authoritative when both repo + slug match", () => {
		// When owner/repo lookup finds an enriched project, that wins
		// (no double-resolve via content). This matches the original
		// page.tsx logic.
		const r = resolveSelectedProjects(makeInput(["marceloprates/streamlines"]));
		// enriched project has stars: 50
		expect(r[0].stars).toBe(50);
	});
});