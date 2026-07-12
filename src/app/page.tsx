import ThemeToggle from "@/components/ThemeToggle";
import { About, Hero } from "@/components/sections";
import { computeAge, siteConfig } from "@/config/site";
import { isEnabled, sections } from "@/config/sections";

/**
 * Home page composition root.
 *
 * As of nav-redesign Phase C (2026-07-12), this is intentionally
 * minimal: Hero + About only. Every other surface (posts,
 * resume, misc) lives at its own route under src/app/(content)/
 * and is reached via the TopNav (src/components/nav/TopNav.tsx).
 *
 * Responsibilities:
 *   1. Compute the dynamic `years` value for the Hero greeting
 *      (driven by the owner's birthDate in siteConfig).
 *   2. Render <ThemeToggle> chrome (decorative only).
 *      FilmGrain moved to the root layout in iter 7 of the
 *      post-nav-cleanup loop so every page gets the grain
 *      texture, not just the home page.
 *   3. Iterate the configured sections array and render each.
 *
 * No data fetching happens at this layer anymore; /projects owns
 * its own data resolution (see src/lib/work-projects.ts).
 */
export default function Home() {
	const years = computeAge(siteConfig.owner.birthDate);

	return (
		<div className="min-h-screen transition-colors">
			<ThemeToggle />
			<main className="px-4 py-16 mx-auto max-w-7xl">
				{sections.filter(isEnabled).map(({ id }) => {
					switch (id) {
						case "hero":
							return <Hero key={id} years={years} />;
						case "about":
							return <About key={id} />;
					}
				})}
			</main>
		</div>
	);
}
