import { Section } from "@/components/Section";
import { PublicationCard } from "@/components/PublicationCard";
import { siteConfig } from "@/config/site";
import type { Publication } from "@/types";

/**
 * Selected Papers section. Wraps a Section primitive + publication
 * grid. The "More on Semantic Scholar" link reads from
 * siteConfig.social.semanticScholar.
 */
export function Papers({ publications }: { publications: Publication[] }) {
	return (
		<Section
			id="papers"
			title="Selected Papers"
			gradient="from-emerald-500 via-teal-500 to-cyan-500"
		>
			<div className="mt-6">
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{publications.map((pub) => (
						<PublicationCard key={pub.title} publication={pub} />
					))}
				</div>
			</div>
			{siteConfig.social.semanticScholar && (
				<p className="mt-8 text-sm text-gray-600 dark:text-gray-300">
					More on{" "}
					<a
						href={siteConfig.social.semanticScholar}
						target="_blank"
						rel="noopener noreferrer"
						className="text-blue-700 dark:text-blue-300 hover:underline"
					>
						Semantic Scholar
					</a>
					.
				</p>
			)}
		</Section>
	);
}