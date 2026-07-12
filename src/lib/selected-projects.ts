import type { Project } from "@/types";

/**
 * Resolves a list of selectedProjects entries (strings) into Project
 * objects ready to render. Extracted from the inline JSX in
 * src/app/page.tsx (was a 50+ line IIFE).
 *
 * Three lookup strategies, tried in order per entry:
 *   1. "owner/repo" → match against enriched GitHub projects
 *   2. "/projects/slug" or "slug" → match against content projects
 *   3. raw title → match against enriched GitHub projects by title
 *
 * The content lookup function is injected (default: getProjectBySlug
 * from src/lib/content.ts) so this module is testable without disk I/O.
 */

export interface ContentProjectMeta {
	slug: string;
}

export interface ContentProjectSource {
	slug: string;
	meta: Record<string, unknown>;
}

export type ContentLookup = (slug: string) => ContentProjectSource | null;

export interface ProjectMetadataEntry {
	hasLocalPage: boolean;
	slug?: string;
}

export interface ResolveSelectedProjectsInput {
	entries: readonly string[];
	allProjects: readonly Project[];
	contentProjects: readonly ContentProjectMeta[];
	projectMetadata: Record<string, ProjectMetadataEntry>;
	getContentBySlug: ContentLookup;
}

/**
 * Resolve a frontmatter image field (image/cover/excerpt's first <img>)
 * to a concrete src URL. Bare filenames are treated as
 * `/images/projects/{slug}/{filename}`.
 */
export function resolveProjectImage(
	meta: Record<string, unknown>,
	slug: string,
): string | undefined {
	const pick = (field: unknown): string | undefined => {
		if (typeof field !== "string") return undefined;
		const img = field.trim();
		if (!img) return undefined;
		return img.startsWith("http") || img.startsWith("/")
			? img
			: `/images/projects/${slug}/${img}`;
	};

	const fromExcerpt = (excerpt: unknown): string | undefined => {
		if (typeof excerpt !== "string") return undefined;
		const m = excerpt.match(/src=["']([^"']+)["']/i);
		return m ? pick(m[1]) : undefined;
	};

	return (
		pick(meta.image) || pick(meta.cover) || fromExcerpt(meta.excerpt) || undefined
	);
}

/**
 * Strip HTML tags from a description string.
 */
function stripHtml(s: string): string {
	return s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

/**
 * Build a Project from a content project's frontmatter.
 */
function projectFromContent(
	contentMatch: ContentProjectMeta,
	content: ContentProjectSource,
): Project {
	const meta = content.meta;
	const imageSrc = resolveProjectImage(meta, contentMatch.slug);
	return {
		title: (meta.title as string) || contentMatch.slug,
		desc: stripHtml((meta.excerpt as string) || (meta.description as string) || ""),
		tags: (meta.tags as string[]) || [],
		link: `/projects/${contentMatch.slug}`,
		repo: (meta.repo as string) || undefined,
		image: imageSrc,
	};
}

/**
 * Resolve a single entry. Returns null if no strategy matched.
 */
function resolveEntry(entry: string, input: ResolveSelectedProjectsInput): Project | null {
	const { allProjects, contentProjects, projectMetadata, getContentBySlug } = input;

	// Strategy 1: owner/repo → match against enriched projects or fall through to slug
	if (entry.includes("/")) {
		const byRepo = allProjects.find(
			(p) => p.repo === entry || (p.link && p.link.includes(entry.split("/")[1])),
		);
		if (byRepo) return byRepo;

		// Repo not found in enriched list — try the last path segment as a local slug
		const last = entry.split("/").filter(Boolean).pop();
		if (last) {
			const match = contentProjects.find(
				(c) => c.slug.toLowerCase() === last.toLowerCase(),
			);
			if (match) {
				const content = getContentBySlug(match.slug);
				if (content) return projectFromContent(match, content);
			}
		}
	}

	// Strategy 2: /projects/slug or bare slug → content lookup
	let slug = entry;
	if (slug.startsWith("/projects/")) slug = slug.replace("/projects/", "");
	const contentMatch = contentProjects.find(
		(c) => c.slug.toLowerCase() === slug.toLowerCase(),
	);
	if (contentMatch) {
		const content = getContentBySlug(contentMatch.slug);
		if (content) return projectFromContent(contentMatch, content);
	}

	// Strategy 3: title match against enriched projects
	const byTitle = allProjects.find(
		(p) => p.title && p.title.toLowerCase() === entry.toLowerCase(),
	);
	if (byTitle) return byTitle;

	return null;
}

/**
 * Resolve all entries, preserving order. Skips unresolvable entries silently
 * (a missing project just disappears from the section).
 */
export function resolveSelectedProjects(input: ResolveSelectedProjectsInput): Project[] {
	const resolved: Project[] = [];
	for (const entry of input.entries) {
		const r = resolveEntry(entry, input);
		if (r) resolved.push(r);
	}
	return resolved;
}

// Re-export for convenience
export { resolveProjectImage as resolveProjectImageFromMeta };