"use client";
/**
 * ResumeTabs.tsx
 *
 * Client component that renders a tabbed interface for switching between
 * the three ATS resume variants (AI/ML Engineer, Data Scientist, ML Engineer).
 * Active variant is driven by React state. Default: AI.
 */
import { useState } from "react";
import { RenderedResume } from "./RenderedResume";
import type { JsonResume } from "@/types/resume";

const VARIANTS = [
	{ id: "ai", label: "AI/ML Engineer", filename: "ai.json" },
	{ id: "ds", label: "Data Scientist", filename: "ds.json" },
	{ id: "ml", label: "ML Engineer", filename: "ml.json" },
] as const;

type VariantId = (typeof VARIANTS)[number]["id"];

// Eagerly import all three JSON files so Next.js bundles them at build time.
// Using the `public/data/resumes/` path (already in `out/` after build).
// For dev/build, we import directly from the static files.
import aiResume from "@/data/resumes/ai.json";
import dsResume from "@/data/resumes/ds.json";
import mlResume from "@/data/resumes/ml.json";

const resumeMap: Record<VariantId, JsonResume> = {
	ai: aiResume as JsonResume,
	ds: dsResume as JsonResume,
	ml: mlResume as JsonResume,
};

export function ResumeTabs() {
	const [active, setActive] = useState<VariantId>("ai");
	const resume = resumeMap[active];

	return (
		<div>
			{/* Tab bar */}
			<div role="tablist" aria-label="Resume variants" className="flex flex-wrap items-center gap-1 mb-4 border-b border-gray-200 dark:border-gray-700">
				{VARIANTS.map((v) => (
					<button
						key={v.id}
						id={`resume-tab-${v.id}`}
						onClick={() => setActive(v.id)}
						className={[
							"px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
							active === v.id
								? "border-blue-700 text-blue-700 dark:border-blue-300 dark:text-blue-300"
								: "border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200",
						].join(" ")}
						aria-selected={active === v.id}
						role="tab"
						aria-controls={`resume-panel-${v.id}`}
					>
						{v.label}
					</button>
				))}
				{/* Download link for the currently active variant.
				 * Lives in the same flex row as the tabs so it's
				 * always visible regardless of which tab is open.
				 * `download` attribute suggests a sensible filename
				 * to the browser; modern browsers honor it for same-
				 * origin URLs. The href points at a static asset
				 * mirrored into public/resumes/ at build time.
				 */}
				<a
					id={`resume-download-${active}`}
					href={`/resumes/${active}.pdf`}
					download={`marceloprates-resume-${active}.pdf`}
					aria-label={`Download ${VARIANTS.find((v) => v.id === active)?.label ?? active} resume as PDF`}
					className="ml-auto mb-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-700 dark:hover:border-blue-300 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
				>
					<svg
						aria-hidden="true"
						className="h-3.5 w-3.5"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						viewBox="0 0 24 24"
					>
						<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
						<polyline points="7 10 12 15 17 10" />
						<line x1="12" y1="15" x2="12" y2="3" />
					</svg>
					Download PDF
				</a>
			</div>

			{/* Resume content */}
			<RenderedResume resume={resume} variantId={active} />

			{/* JSON-LD structured data — injected below the article for SEO */}
			<JsonLd resume={resume} />
		</div>
	);
}

/**
 * Renders JSON-LD schema.org Person markup for the active resume variant.
 * Search engines use this for rich results (Person, JobPosting).
 */
function JsonLd({ resume }: { resume: JsonResume }) {
	const { basics, skills, work } = resume;

	// Flatten skill keywords for knowsAbout
	const knowsAbout = skills.flatMap((s) =>
		s.keywords.length > 0 ? s.keywords : [s.name],
	);

	const schema = {
		"@context": "https://schema.org",
		"@type": "Person",
		name: basics.name,
		jobTitle: basics.label,
		email: basics.email,
		url: basics.website,
		sameAs: basics.profiles.map((p) => p.url),
		knowsAbout,
		worksFor: work[0]
			? {
					"@type": "Organization",
					name: work[0].name,
					location: work[0].location,
				}
			: undefined,
		hasOccupation: {
			"@type": "Occupation",
			name: basics.label,
			description: basics.summary,
			skills: knowsAbout,
		},
	};

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
		/>
	);
}
