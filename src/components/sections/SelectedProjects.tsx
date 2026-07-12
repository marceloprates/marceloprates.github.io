import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ProjectCard } from "@/components/ProjectCard";
import { StarshipCard } from "@/components/StarshipCard";
import type { Project } from "@/types";

/**
 * Selected Projects section. Pure presentational.
 *
 * Takes a pre-resolved list of projects (the composition root is
 * responsible for calling resolveSelectedProjects with the right
 * data). Renders the StarshipCard as the first card, followed by
 * each project card in order.
 *
 * Why no resolver inside: keeps the section dumb (no fs reads, no
 * content lookups) so it can be statically analyzed and reused on
 * other routes later.
 */
export function SelectedProjects({ projects }: { projects: Project[] }) {
	return (
		<section id="projects" className="mt-24 mb-16">
			<div className="flex items-baseline justify-between mb-8">
				<h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight text-gray-900 dark:text-white">
					Selected Projects
				</h2>
				<Link
					href="/projects"
					className="text-sm font-medium text-blue-700 dark:text-blue-300 hover:underline inline-flex items-center gap-1"
					aria-label="See all projects"
				>
					All <ArrowRight className="w-4 h-4" />
				</Link>
			</div>
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				<StarshipCard href="/starship" />
				{projects.map((p) => (
					<ProjectCard key={p.title} project={p} />
				))}
			</div>
		</section>
	);
}