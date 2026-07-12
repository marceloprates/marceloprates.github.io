import { ArrowRight } from "lucide-react";
import { ProjectCard } from "@/components/ProjectCard";
import { siteConfig } from "@/config/site";
import type { Project } from "@/types";

/**
 * Open Source section. Renders an externally-linked GitHub profile
 * with the owner's repos sorted by stars (descending).
 *
 * Takes a pre-filtered, pre-sorted list of Project objects from the
 * composition root. Excluded repos (githubConfig.excludeFromPages)
 * are filtered out before being passed in.
 */
export function OpenSource({ projects }: { projects: Project[] }) {
	return (
		<section id="open-source" className="mt-24 mb-16">
			<div className="flex items-center justify-between mb-8">
				<h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
					Open Source
				</h2>
				<a
					href={siteConfig.social.github}
					className="text-sm font-medium text-blue-700 dark:text-blue-300 hover:underline inline-flex items-center gap-1"
					aria-label="See GitHub"
				>
					All on GitHub <ArrowRight className="w-4 h-4" />
				</a>
			</div>
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{projects.map((p) => (
					<ProjectCard key={p.title} project={p} />
				))}
			</div>
		</section>
	);
}