import { getAllProjects } from '@/lib/content';
import ProjectCard from '@/components/ProjectCard';
import { ListingPageLayout } from '@/components/ListingPageLayout';

/**
 * /projects listing — discoverability surface for markdown project pages.
 * Maps ProjectMeta -> ProjectCard.project inline, including the cover image
 * extracted at build time by getAllProjects() (cover: frontmatter, or
 * <img src> fallback inside the excerpt).
 */
export default function ProjectsIndexPage() {
    const projects = getAllProjects();

    return (
        <ListingPageLayout
            title="Projects"
            gradient="from-blue-500 via-indigo-500 to-purple-500"
        >
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
                            image: project.image,
                        }}
                    />
                ))}
            </div>
        </ListingPageLayout>
    );
}