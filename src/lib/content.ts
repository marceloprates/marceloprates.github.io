import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { stripHtml } from './excerpt';
import { resolveCoverImage, slugFromFilename } from './cover-image';
import type { PostFrontmatter, PostMeta } from '@/data/post-schema';
import type { ProjectFrontmatter, ProjectMeta } from '@/data/project-schema';

// Re-export the per-kind types so existing `import { PostMeta } from '@/lib/content'`
// call sites continue to work. New code should import from the schema files
// directly to make the type provenance explicit.
export type { PostMeta, ProjectMeta };

export interface ContentEntry<F> {
    meta: F;
    content: string;
}

/**
 * Resolve the content root lazily so that `vi.spyOn(process, 'cwd')`
 * works in tests. Module-level constants computed at import time would
 * be locked to the real cwd before any test runs.
 */
function getContentRoot(): string {
    return path.join(process.cwd(), 'content');
}

/**
 * Resolve the portfolio-bodies root lazily so that `vi.spyOn(process,
 * 'cwd')` works in tests.
 */
function getPortfolioBodiesRoot(): string {
    return path.join(process.cwd(), 'portfolio-bodies');
}

/* ------------------------------------------------------------------ *
 * Portfolio bodies fallback (private-portfolio-candidates Phase C)
 *
 * When a project slug doesn't have a local `content/projects/<slug>.md`,
 * fall back to the scan-cached `portfolio-bodies/<owner>-<name>/portfolio.md`
 * (see `npm run scan:portfolio`). This lets opted-in private repos surface
 * on the public site without making the source repo public.
 *
 * Each cached body has a sidecar `portfolio.meta.json` carrying build-time
 * metadata the body fallback needs:
 *   - `visibility`: 'public' | 'private' — drives the `private` badge.
 *   - `owner`, `name`: canonical repo identifier.
 *   - `defaultBranch`, `stars`: for /projects metadata.
 * ------------------------------------------------------------------ */

interface PortfolioBodyMetaSidecar {
    owner: string;
    name: string;
    visibility: 'public' | 'private';
    defaultBranch: string;
    stars: number;
}

/**
 * Build a `slug → file path` index for portfolio bodies. Lazily
 * initialized and cached at module level so we only scan
 * `portfolio-bodies/` once per process.
 *
 * Slug resolution order: frontmatter `slug:` > filename's `<name>` part
 * (from `<owner>-<name>`) > folder name as a last resort. A body whose
 * frontmatter fails to parse OR whose slug can't be determined is skipped
 * with a console warning (it shouldn't happen if the scan ran, but a
 * hand-edited `portfolio-bodies/` shouldn't crash the build).
 *
 * `root` parameter defaults to `process.cwd()/portfolio-bodies`. Tests
 * pass a tmp dir.
 */
let portfolioBodiesIndex: Map<string, string> | null = null;
let portfolioBodiesIndexRoot: string | null = null;

function readPortfolioMetaSidecar(filePath: string): PortfolioBodyMetaSidecar | null {
    const dir = path.dirname(filePath);
    const sidecarPath = path.join(dir, 'portfolio.meta.json');
    if (!fs.existsSync(sidecarPath)) return null;
    try {
        const raw = fs.readFileSync(sidecarPath, 'utf8');
        const parsed = JSON.parse(raw);
        if (
            typeof parsed === 'object' &&
            parsed !== null &&
            typeof parsed.owner === 'string' &&
            typeof parsed.name === 'string' &&
            (parsed.visibility === 'public' || parsed.visibility === 'private')
        ) {
            return parsed as PortfolioBodyMetaSidecar;
        }
        return null;
    } catch {
        return null;
    }
}

function deriveSlugFromFrontmatter(data: Record<string, unknown>, folderName: string): string | null {
    // 1. Explicit slug in frontmatter wins.
    const fmSlug = data.slug;
    if (typeof fmSlug === 'string' && fmSlug.length > 0) return fmSlug;

    // 2. Fall back to the <name> part of `<owner>-<name>`. The dash split
    //    can be ambiguous for repos whose names start with the owner name
    //    (e.g. `marceloprates-marceloprates`), so we use `indexOf` and
    //    skip the leading owner segment.
    const dashIdx = folderName.indexOf('-');
    if (dashIdx >= 0 && dashIdx < folderName.length - 1) {
        return folderName.slice(dashIdx + 1);
    }
    return folderName.length > 0 ? folderName : null;
}

/**
 * Pure(ish): build a slug → file map from `root`. Re-exported for tests.
 */
export function buildPortfolioBodiesIndexForRoot(root: string): Map<string, string> {
    const map = new Map<string, string>();
    if (!fs.existsSync(root)) return map;

    const entries = fs.readdirSync(root, { withFileTypes: true });
    for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const filePath = path.join(root, entry.name, 'portfolio.md');
        if (!fs.existsSync(filePath)) continue;

        let slug: string | null = null;
        try {
            const raw = fs.readFileSync(filePath, 'utf8');
            const parsed = matter(raw);
            slug = deriveSlugFromFrontmatter(
                (parsed.data ?? {}) as Record<string, unknown>,
                entry.name,
            );
        } catch {
            // Malformed frontmatter — skip with a warning below.
        }
        if (slug === null) {
            console.warn(
                `[content] skipping ${root}/${entry.name}/portfolio.md: unable to determine slug from frontmatter or folder name`,
            );
            continue;
        }
        if (map.has(slug)) {
            console.warn(
                `[content] duplicate slug '${slug}' in ${root}; last write wins (existing: ${map.get(slug)}, new: ${filePath})`,
            );
        }
        map.set(slug, filePath);
    }
    return map;
}

function getPortfolioBodyFile(slug: string): string | null {
    const root = getPortfolioBodiesRoot();
    if (portfolioBodiesIndex === null || portfolioBodiesIndexRoot !== root) {
        portfolioBodiesIndex = buildPortfolioBodiesIndexForRoot(root);
        portfolioBodiesIndexRoot = root;
    }
    return portfolioBodiesIndex.get(slug) ?? null;
}

/**
 * Read a portfolio body + sidecar, returning a ContentEntry whose `meta`
 * is shaped for the detail page (title from frontmatter or H1, slug,
 * optional cover, optional private/tier from sidecar visibility).
 *
 * Re-exported for unit tests with a controlled `filePath`.
 */
export function readPortfolioBodyFromFile(
    slug: string,
    filePath: string,
): ContentEntry<ProjectFrontmatter> | null {
    const sidecar = readPortfolioMetaSidecar(filePath);
    if (!sidecar) {
        console.warn(
            `[content] portfolio-bodies/${slug} is missing a valid portfolio.meta.json sidecar; cannot render`,
        );
        return null;
    }

    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = matter(raw);

    // Pull title from frontmatter, else first H1 in body, else slug.
    let title: string | undefined;
    const fmTitle = (parsed.data as Record<string, unknown>)?.title;
    if (typeof fmTitle === 'string' && fmTitle.length > 0) {
        title = fmTitle;
    } else {
        const h1Match = parsed.content.match(/^\s*#\s+(.+?)\s*$/m);
        if (h1Match) title = h1Match[1];
    }
    if (!title) title = slug;

    const meta: ProjectFrontmatter = {
        ...(parsed.data as Record<string, unknown>),
        title,
        slug,
        // Sidecar drives the badge: only private repos opted in via
        // portfolio.md should display the `private` badge on the card
        // and detail page. Public repos with portfolio.md render
        // normally without the badge.
        ...(sidecar.visibility === 'private' ? { private: true } : {}),
    };

    return { meta, content: parsed.content };
}

function readPortfolioBody(slug: string): ContentEntry<ProjectFrontmatter> | null {
    const filePath = getPortfolioBodyFile(slug);
    if (!filePath) return null;
    return readPortfolioBodyFromFile(slug, filePath);
}

/**
 * Reset the portfolio-bodies index cache. Test-only — lets unit tests
 * exercise the lazy-init logic without leaking state between cases.
 */
export function _resetPortfolioBodiesIndexForTests(): void {
    portfolioBodiesIndex = null;
    portfolioBodiesIndexRoot = null;
}

/**
 * Every post slug on disk (including drafts). Used by
 * `generateStaticParams()` for the `[slug]/page.tsx` route — Next's
 * static export needs an exhaustive slug list so the build can
 * pre-render a 404 for any slug that turns out to be a draft at
 * render time. Keeping the list unfiltered here is intentional;
 * the public-facing `getAllPosts()` is the one that filters.
 */
export function getAllPostSlugs(): string[] {
    const dir = path.join(getContentRoot(), 'posts');
    if (!fs.existsSync(dir)) return [];
    return fs
        .readdirSync(dir)
        .filter((f) => f.endsWith('.md') || f.endsWith('.markdown'))
        .map(slugFromFilename);
}

export function getAllPosts(): PostMeta[] {
    const dir = path.join(getContentRoot(), 'posts');
    if (!fs.existsSync(dir)) return [];
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md') || f.endsWith('.markdown'));
    const items = files.map((file) => {
        const raw = fs.readFileSync(path.join(dir, file), 'utf8');
        const parsed = matter(raw);
        const name = slugFromFilename(file);
        const meta = parsed.data || {};
        const excerptHtml = meta.excerpt || meta.summary || '';
        const image = resolveCoverImage(meta, excerptHtml);
        return {
            title: meta.title || name,
            date: meta.date || undefined,
            tags: Array.isArray(meta.tags) ? meta.tags : meta.tags ? [meta.tags] : [],
            // Sanitize at extraction time; ProjectCard renders as plain
            // text. Cover <img> is extracted separately into `image`.
            excerpt: stripHtml(excerptHtml),
            image,
            slug: name,
            draft: meta.draft === true,
        } as PostMeta;
    })
    // Filter out drafts so the public site /posts listing and the ⌘K
    // palette don't surface unpublished work. Drafts are still readable
    // from disk via the markdown source for the author.
    .filter((p) => !p.draft);
    items.sort((a, b) => (a.date && b.date ? (a.date > b.date ? -1 : 1) : 0));
    return items;
}

export function getPostBySlug(slug: string): ContentEntry<PostFrontmatter> | null {
    const dir = path.join(getContentRoot(), 'posts');
    if (!fs.existsSync(dir)) return null;
    const files = fs.readdirSync(dir);
    const file = files.find((f) => {
        // Match exact slug, ignoring extension and any leading YYYY-MM-DD- date prefix (mirrors getProjectBySlug).
        const base = f.replace(/\.mdx?$|\.markdown$/i, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
        return base === slug || base.toLowerCase() === slug.toLowerCase();
    });
    if (!file) return null;
    const raw = fs.readFileSync(path.join(dir, file), 'utf8');
    const parsed = matter(raw);
    // Drafts are unreachable from the public site. The page route
    // surfaces a 404 via generateStaticParams excluding drafts, and
    // this lookup returns null for direct slugs as a defense in depth.
    if (parsed.data?.draft === true) return null;
    // Runtime conformance is enforced by `npm run validate:frontmatter`
    // (precommit gate). At build-time we know content/* conforms to the
    // schema, so the assertion is safe.
    return {
        meta: parsed.data as PostFrontmatter,
        content: parsed.content,
    };
}

// Projects (markdown pages stored under content/projects)
export function getAllProjects(): ProjectMeta[] {
    const dir = path.join(getContentRoot(), 'projects');
    if (!fs.existsSync(dir)) return [];
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md') || f.endsWith('.markdown'));
    const items = files.map((file) => {
        const raw = fs.readFileSync(path.join(dir, file), 'utf8');
        const parsed = matter(raw);
        const name = slugFromFilename(file);
        const meta = parsed.data || {};
        const excerptHtml = meta.excerpt || meta.summary || '';
        const image = resolveCoverImage(meta, excerptHtml);
        return {
            title: meta.title || name,
            date: meta.date || undefined,
            tags: Array.isArray(meta.tags) ? meta.tags : meta.tags ? [meta.tags] : [],
            // Sanitize at extraction time; ProjectCard renders as plain
            // text. Cover <img> is extracted separately into `image`.
            excerpt: stripHtml(excerptHtml),
            image,
            slug: name,
        } as PostMeta;
    });
    items.sort((a, b) => (a.date && b.date ? (a.date > b.date ? -1 : 1) : 0));
    return items;
}

export function getProjectBySlug(slug: string): ContentEntry<ProjectFrontmatter> | null {
    const dir = path.join(getContentRoot(), 'projects');
    if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        const file = files.find((f) => {
            // Match either exact slug or {owner}-{repo} style GitHub repo slugs
            const base = f.replace(/\.mdx?$|\.markdown$/i, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
            return base === slug || base.toLowerCase() === slug.toLowerCase();
        });
        if (file) {
            const raw = fs.readFileSync(path.join(dir, file), 'utf8');
            const parsed = matter(raw);
            // Runtime conformance is enforced by `npm run validate:frontmatter`
            // (precommit gate). At build-time we know content/* conforms to the
            // schema, so the assertion is safe.
            return {
                meta: parsed.data as ProjectFrontmatter,
                content: parsed.content,
            };
        }
    }
    // Fall back to portfolio bodies for opted-in private repos whose
    // `portfolio.md` is cached locally under `portfolio-bodies/`. See
    // `npm run scan:portfolio` and `.ralph/private-portfolio-candidates.md`.
    return readPortfolioBody(slug);
}
