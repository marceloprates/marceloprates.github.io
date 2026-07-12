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

const contentRoot = path.join(process.cwd(), 'content');

export function getAllPosts(): PostMeta[] {
    const dir = path.join(contentRoot, 'posts');
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
    const dir = path.join(contentRoot, 'posts');
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
    const dir = path.join(contentRoot, 'projects');
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
    const dir = path.join(contentRoot, 'projects');
    if (!fs.existsSync(dir)) return null;
    const files = fs.readdirSync(dir);
    const file = files.find((f) => {
        // Match either exact slug or {owner}-{repo} style GitHub repo slugs
        const base = f.replace(/\.mdx?$|\.markdown$/i, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
        return base === slug || base.toLowerCase() === slug.toLowerCase();
    });
    if (!file) return null;
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
