import { getAllProjects } from '@/lib/content';
import ProjectCard from '@/components/ProjectCard';
import { ListingPageLayout } from '@/components/ListingPageLayout';

/**
 * /projects listing — discoverability surface for markdown project pages
 * living in content/projects/.
 *
 * Thin ListingPageLayout wrapper. Maps PostMeta -> ProjectCard.project
 * shape inline (title, desc:=excerpt, tags, link:=/projects/{slug}).
 *
 * Image is left undefined; getAllProjects() does not yet extract
 * cover/image from frontmatter (deferred).
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
                            image: undefined,
                        }}
                    />
                ))}
            </div>
        </ListingPageLayout>
    );
}