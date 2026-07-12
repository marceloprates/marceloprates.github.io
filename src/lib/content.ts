import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { stripHtml } from './excerpt';

const contentRoot = path.join(process.cwd(), 'content');

export type PostMeta = {
    title: string;
    date?: string;
    tags?: string[];
    excerpt?: string;
    /**
     * Optional cover image URL extracted from the post excerpt HTML at
     * build time. Set automatically when the excerpt begins with an
     * <img> tag. This avoids needing DOMParser inside PostCard.tsx
     * (which previously parsed the excerpt in the browser).
     */
    image?: string;
    slug: string;
};

/**
 * Extract an <img src="..."> URL from an HTML excerpt string.
 * Returns undefined if the excerpt is plain text or has no image.
 */
function extractFirstImageUrl(html: string): string | undefined {
    if (!html) return undefined;
    const m = html.match(/<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/i);
    return m?.[1] || undefined;
}

export function getAllPosts(): PostMeta[] {
    const dir = path.join(contentRoot, 'posts');
    if (!fs.existsSync(dir)) return [];
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md') || f.endsWith('.markdown'));
    const items = files.map((file) => {
        const raw = fs.readFileSync(path.join(dir, file), 'utf8');
        const parsed = matter(raw);
        const name = file.replace(/\.mdx?$|\.markdown$/i, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
        const meta = parsed.data || {};
        const excerptHtml = meta.excerpt || meta.summary || '';
        return {
            title: meta.title || name,
            date: meta.date || undefined,
            tags: Array.isArray(meta.tags) ? meta.tags : meta.tags ? [meta.tags] : [],
            // Sanitize at extraction time; ProjectCard renders as plain
            // text. Cover <img> is extracted separately into `image`.
            excerpt: stripHtml(excerptHtml),
            image: extractFirstImageUrl(excerptHtml),
            slug: name,
        } as PostMeta;
    });
    items.sort((a, b) => (a.date && b.date ? (a.date > b.date ? -1 : 1) : 0));
    return items;
}

export function getPostBySlug(slug: string) {
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
    return { meta: parsed.data, content: parsed.content };
}

// Projects (markdown pages stored under content/projects)
export function getAllProjects(): PostMeta[] {
    const dir = path.join(contentRoot, 'projects');
    if (!fs.existsSync(dir)) return [];
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md') || f.endsWith('.markdown'));
    const items = files.map((file) => {
        const raw = fs.readFileSync(path.join(dir, file), 'utf8');
        const parsed = matter(raw);
        // keep filename without extension and strip leading date if present
        const name = file.replace(/\.mdx?$|\.markdown$/i, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
        const meta = parsed.data || {};
        const excerptHtml = meta.excerpt || meta.summary || '';
        // Cover contract: `cover:` frontmatter preferred; if absent, fall
        // back to the first <img src> in the excerpt (mirrors
        // getAllPosts' image extraction pattern).
        const image = (typeof meta.cover === 'string' && meta.cover.length > 0
            ? meta.cover
            : extractFirstImageUrl(excerptHtml));
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

export function getProjectBySlug(slug: string) {
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
    return { meta: parsed.data, content: parsed.content };
}
