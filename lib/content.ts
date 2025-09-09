import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentRoot = path.join(process.cwd(), 'content');

export type PostMeta = {
    title: string;
    date?: string;
    tags?: string[];
    excerpt?: string;
    slug: string;
};

export function getAllPosts(): PostMeta[] {
    const dir = path.join(contentRoot, 'posts');
    if (!fs.existsSync(dir)) return [];
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md') || f.endsWith('.markdown'));
    const items = files.map((file) => {
        const raw = fs.readFileSync(path.join(dir, file), 'utf8');
        const parsed = matter(raw);
        const name = file.replace(/\.mdx?$|\.markdown$/i, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
        const meta = parsed.data || {};
        return {
            title: meta.title || name,
            date: meta.date || undefined,
            tags: Array.isArray(meta.tags) ? meta.tags : meta.tags ? [meta.tags] : [],
            excerpt: meta.excerpt || meta.summary || '',
            slug: name,
        } as PostMeta;
    });
    items.sort((a, b) => (a.date && b.date ? (a.date > b.date ? -1 : 1) : 0));
    return items;
}

export function getPostBySlug(slug: string) {
    const dir = path.join(contentRoot, 'posts');
    const files = fs.readdirSync(dir);
    const file = files.find((f) => f.includes(slug));
    if (!file) return null;
    const raw = fs.readFileSync(path.join(dir, file), 'utf8');
    const parsed = matter(raw);
    return { meta: parsed.data, content: parsed.content };
}
