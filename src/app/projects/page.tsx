import { getAllProjects } from '@/lib/content';
import ProjectCard from '@/components/ProjectCard';
import { Section } from '@/components/Section';
import type { Metadata } from 'next';

/**
 * /projects listing — discoverability surface for markdown project pages
 * living in content/projects/.
 *
 * Mirrors src/app/posts/page.tsx in structure but renders ProjectCard
 * directly (no PostCard wrapper) since these are projects, not posts.
 *
 * Mapping from PostMeta -> ProjectCard.project:
 *   - title: post.title
 *   - desc: post.excerpt || ''
 *   - tags: post.tags || []
 *   - link: `/projects/${post.slug}`
 *
 * Image is left undefined for now; `getAllProjects()` does not yet
 * extract `cover`/`image` from frontmatter. Adding that extraction
 * is a separate enhancement (deferred to keep this iter focused on
 * listing-page plumbing).
 */
export const metadata: Metadata = {
    title: 'Projects — Marcelo Prates',
    description: 'Selected programming and generative-art projects, with deep-dives into each.',
};

export default function ProjectsIndexPage() {
    const projects = getAllProjects();

    return (
        <main className="px-4 py-16 mx-auto max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight">Projects</h1>
            <Section
                id="projects"
                title="All projects"
                gradient="from-blue-500 via-indigo-500 to-purple-500"
                as="h2"
            >
                {projects.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 italic">
                        No projects yet.
                    </p>
                ) : (
                    <div className="grid gap-6">
                        {projects.map((project) => (
                            <ProjectCard
                                key={project.slug}
                                project={{
                                    title: project.title,
                                    desc: project.excerpt || '',
                                    tags: project.tags || [],
                                    link: `/projects/${project.slug}`,
                                    repo: undefined,
                                    image: undefined,
                                }}
                            />
                        ))}
                    </div>
                )}
            </Section>
        </main>
    );
}
