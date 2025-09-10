import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export function getProjectMetadata() {
    const metadata: Record<string, { hasLocalPage: boolean; slug?: string }> = {};
    const projectsDir = path.join(process.cwd(), 'content/projects');

    try {
        if (!fs.existsSync(projectsDir)) return metadata;

        const files = fs.readdirSync(projectsDir);
        files.forEach((file) => {
            if (!file.endsWith('.md') && !file.endsWith('.markdown')) return;

            const raw = fs.readFileSync(path.join(projectsDir, file), 'utf8');
            // Use gray-matter to parse YAML frontmatter reliably
            const parsed = matter(raw);
            const repo = parsed.data?.repo;

            if (typeof repo === 'string' && repo.trim().length > 0) {
                // derive slug from filename (strip date prefix and extension)
                const slug = file.replace(/\.mdx?$|\.markdown$/i, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
                metadata[repo.trim()] = { hasLocalPage: true, slug };
            }
        });
    } catch (error) {
        console.error('Error reading project metadata:', error);
    }

    return metadata;
}
