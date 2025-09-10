import { Project } from '@/types';

interface ProjectMetadata {
    [repo: string]: {
        hasLocalPage: boolean;
        slug?: string;
    };
}

// This will be populated at build time and be available statically
declare global {
    interface Window {
        __PROJECT_METADATA__: ProjectMetadata;
    }
}

/**
 * Returns the best link to use for a project card:
 * - If the project has a dedicated blog post/page, use that (/projects/slug)
 * - Otherwise use the original external link (e.g. GitHub repo URL)
 */
export function getProjectLink(project: Project): string {
    // Always try the GitHub slug first if it's a repo
    if (project.repo) {
        // Get metadata from global object (populated at build time)
        const metadata = typeof window !== 'undefined' ? window.__PROJECT_METADATA__ : {};
        const meta = metadata[project.repo];

        if (meta && meta.hasLocalPage) {
            // Prefer explicitly recorded slug when available
            const slug = meta.slug || project.repo.split('/')[1];
            return `/projects/${slug}`;
        }
    }

    // For non-GitHub projects or if no local page exists, use the original link
    return project.link;
}
