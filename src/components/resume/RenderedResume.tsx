"use client";
/**
 * RenderedResume.tsx
 *
 * Renders a JSON Resume object as semantic, recruiter-friendly HTML.
 * Used by ResumeTabs for each variant tab.
 */
import type { JsonResume } from "@/types/resume";
import { Mail, Linkedin, Github, Globe } from "lucide-react";

interface Props {
	resume: JsonResume;
	variantId: string;
}

export function RenderedResume({ resume, variantId }: Props) {
	const { basics, work, skills, education } = resume;

	return (
		<div
			id={`resume-panel-${variantId}`}
			role="tabpanel"
			aria-labelledby={`resume-tab-${variantId}`}
			className="font-sans text-sm text-gray-800 dark:text-gray-200"
		>
			{/* ── Header ── */}
			<header className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
					{basics.name}
				</h1>
				<p className="mt-0.5 text-base text-gray-600 dark:text-gray-400">
					{basics.label}
				</p>
				<div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
					<span className="flex items-center gap-1">
						<Mail className="w-3 h-3" />
						<a
							href={`mailto:${basics.email}`}
							className="hover:text-blue-600 dark:hover:text-blue-400"
						>
							{basics.email}
						</a>
					</span>
					{basics.profiles.map((p) => {
						const Icon =
							p.network === "LinkedIn"
								? Linkedin
								: p.network === "GitHub"
									? Github
									: Globe;
						return (
							<span key={p.network} className="flex items-center gap-1">
								<Icon className="w-3 h-3" />
								<a
									href={p.url}
									target="_blank"
									rel="noopener noreferrer"
									className="hover:text-blue-600 dark:hover:text-blue-400"
								>
									{p.network.toLowerCase()}.com/{p.username}
								</a>
							</span>
						);
					})}
					<span className="flex items-center gap-1">
						<span aria-hidden="true">📍</span>
						{basics.location.city}, {basics.location.region},{" "}
						{basics.location.country}
					</span>
				</div>
			</header>

			{/* ── Summary ── */}
			{basics.summary && (
				<section id="summary" className="mb-6">
					<h2 className="text-xs font-semibold uppercase tracking-widest text-gray-600 dark:text-gray-400 mb-2">
						Summary
					</h2>
					<p className="leading-relaxed text-gray-700 dark:text-gray-300">
						{basics.summary}
					</p>
				</section>
			)}

			{/* ── Skills ── */}
			{skills.length > 0 && (
				<section id="skills" className="mb-6">
					<h2 className="text-xs font-semibold uppercase tracking-widest text-gray-600 dark:text-gray-400 mb-3">
						Skills
					</h2>
					<div className="flex flex-wrap gap-2">
						{skills.map((skill, i) => (
							<div
								key={i}
								className="inline-flex flex-col gap-1 rounded border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs"
							>
								<span className="font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap">
									{skill.name}
								</span>
								{skill.keywords.length > 0 && (
									<span className="text-gray-600 dark:text-gray-400 leading-relaxed">
										{skill.keywords.join(" · ")}
									</span>
								)}
							</div>
						))}
					</div>
				</section>
			)}

			{/* ── Experience ── */}
			{work.length > 0 && (
				<section id="experience" className="mb-6">
					<h2 className="text-xs font-semibold uppercase tracking-widest text-gray-600 dark:text-gray-400 mb-3">
						Experience
					</h2>
					<div className="space-y-5">
						{work.map((job, i) => (
							<article
								key={i}
								className="relative pl-4 border-l-2 border-gray-100 dark:border-gray-800 first:border-l-blue-400 dark:first:border-l-blue-600"
							>
								<div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5">
									<div>
										<h3 className="text-sm font-semibold text-gray-900 dark:text-white">
											{job.position}
										</h3>
										<p className="text-xs text-gray-600 dark:text-gray-400">
											{job.name}
											{job.location ? `, ${job.location}` : ""}
										</p>
									</div>
									<time
										className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap shrink-0"
										dateTime={`${job.startDate}/${job.endDate}`}
									>
										{job.startDate} – {job.endDate}
									</time>
								</div>
								{job.highlights.length > 0 && (
									<ul className="mt-2 space-y-1 list-none">
										{job.highlights.map((bullet, j) => (
											<li
												key={j}
												className="text-xs leading-relaxed text-gray-600 dark:text-gray-400 pl-0 before:content-['–_'] before:text-gray-300 dark:before:text-gray-600"
											>
												{bullet}
											</li>
										))}
									</ul>
								)}
							</article>
						))}
					</div>
				</section>
			)}

			{/* ── Education ── */}
			{education.length > 0 && (
				<section id="education">
					<h2 className="text-xs font-semibold uppercase tracking-widest text-gray-600 dark:text-gray-400 mb-3">
						Education
					</h2>
					<div className="space-y-3">
						{education.map((edu, i) => (
							<div
								key={i}
								className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5"
							>
								<div>
									<p className="text-sm font-medium text-gray-800 dark:text-gray-200">
										{edu.studyType} in {edu.area}
									</p>
									<p className="text-xs text-gray-600 dark:text-gray-400">
										{edu.institution}
									</p>
								</div>
								<time className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap shrink-0">
									{edu.startDate} – {edu.endDate}
								</time>
							</div>
						))}
					</div>
				</section>
			)}
		</div>
	);
}
