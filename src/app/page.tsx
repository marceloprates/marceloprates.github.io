import { FilmGrain } from "@/components/FilmGrain";
import ThemeToggle from "@/components/ThemeToggle";
import {
	About,
	Hero,
	OpenSource,
	Papers,
	QuickTiles,
	Resume,
	SelectedProjects,
} from "@/components/sections";
import { computeAge, siteConfig } from "@/config/site";
import { isEnabled, sections } from "@/config/sections";
import { projects as rawProjects } from "@/data/projects";
import { publications as staticPublications } from "@/data/publications";
import { selectedProjects as selectedEntries } from "@/data/selected-projects";
import { githubConfig } from "../../config/github";
import { getAllProjects as getAllContentProjects, getProjectBySlug } from "@/lib/content";
import { fetchPublications } from "@/lib/publications.server";
import { getProjectMetadata } from "@/lib/project-metadata.server";
import { enrichProjects } from "@/lib/project-enricher";
import { resolveSelectedProjects } from "@/lib/selected-projects";
import type { Project } from "@/types";

/**
 * Home page composition root.
 *
 * Responsibilities (and ONLY these):
 *   1. Fetch/resolve data (publications, enriched projects, content metadata).
 *   2. Override `link` on enriched projects that have a local content page.
 *   3. Iterate the configured sections array and render each section with
 *      its required props.
 *
 * Visual layout, content strings, and section-level logic live in
 * src/components/sections/*. Config (owner info, social URLs, section
 * order) lives in src/config/. Data helpers live in src/lib/.
 */
export default async function Home() {
	const years = computeAge(siteConfig.owner.birthDate);

	// 1. Publications: prefer fresh fetch, fall back to static snapshot.
	const fetched = await fetchPublications();
	const publications = fetched.length ? fetched : staticPublications;

	// 2. Enrich projects with GitHub stats (stars/forks) at build time.
	const { enriched } = await enrichProjects(rawProjects);
	const projectMetadata = getProjectMetadata();

	// 3. Override `link` for projects that have a local content page.
	//    Without this, a project matched by repo would point at the
	//    GitHub URL even if a /projects/[slug] page exists.
	const enrichedWithLinks: Project[] = enriched.map((p) => {
		if (p.repo && projectMetadata[p.repo]?.hasLocalPage) {
			const slug = projectMetadata[p.repo].slug || p.repo.split("/")[1];
			return { ...p, link: `/projects/${slug}` };
		}
		return p;
	});

	// 4. OpenSource section data: filter excluded repos, sort by stars desc.
	const openSourceProjects = enrichedWithLinks
		.filter((p) => p.repo && !githubConfig.excludeFromPages.includes(p.repo))
		.sort((a, b) => (b.stars || 0) - (a.stars || 0));

	// 5. SelectedProjects section data: resolve curated entries via
	//    owner/repo + slug + title lookup strategies.
	const contentProjects = getAllContentProjects();
	const selectedProjects = resolveSelectedProjects({
		entries: selectedEntries,
		allProjects: enrichedWithLinks,
		contentProjects,
		projectMetadata,
		getContentBySlug: getProjectBySlug,
	});

	return (
		<div className="min-h-screen transition-colors">
			<FilmGrain
				className="pointer-events-none fixed inset-0"
				intensity={20}
				fps={0}
				tileSize={800}
			/>
			<ThemeToggle />
			<main className="px-4 py-16 mx-auto max-w-7xl">
				{sections.filter(isEnabled).map(({ id }) => {
					switch (id) {
						case "hero":
							return <Hero key={id} years={years} />;
						case "quick-tiles":
							return <QuickTiles key={id} />;
						case "about":
							return <About key={id} />;
						case "selected-projects":
							return <SelectedProjects key={id} projects={selectedProjects} />;
						case "open-source":
							return <OpenSource key={id} projects={openSourceProjects} />;
						case "papers":
							return <Papers key={id} publications={publications} />;
						case "resume":
							return <Resume key={id} />;
					}
				})}
			</main>
		</div>
	);
}