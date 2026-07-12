import type { Metadata } from "next";
import Link from "next/link";

import { ResumeTabs } from "@/components/resume/ResumeTabs";
import { siteConfig } from "@/config/site";

/**
 * /resume — dedicated resume page.
 *
 * Phase E of nav-redesign. Wraps the existing <ResumeTabs>
 * client component in a route layout that adds:
 *   - metadata
 *   - back-to-home link
 *   - canonical URL announcement (for the JSON-LD the tabs emit)
 *
 * The home page no longer renders a Resume section (Phase C
 * removed the bento + the section). Anything that used to live at
 * #resume inside the home page now lives here.
 */
export const metadata: Metadata = {
    title: "Resume — Marcelo Prates",
    description:
        "PDF resumes + JSON Resume variants (AI Engineer, AI/ML, Data Scientist, ML Engineer).",
};

export default function ResumePage() {
    return (
        <main className="px-4 py-16 mx-auto max-w-5xl">
            <nav className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                <Link
                    href="/"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    ← Back home
                </Link>
            </nav>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                Resume
            </h1>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 mb-12 max-w-2xl">
                Three ATS-friendly variants, plus the JSON Resume
                schema. Pick a tab and download the PDF, or copy the
                canonical URL below for the structured data.
            </p>

            <ResumeTabs />

            <p className="mt-12 text-xs text-gray-500 dark:text-gray-400">
                Canonical:&nbsp;
                <a
                    href={`${siteConfig.owner.shortName.toLowerCase()}.github.io/#resume`}
                    className="hover:underline"
                    rel="noopener noreferrer"
                >
                    {siteConfig.owner.shortName.toLowerCase()}.github.io/#resume
                </a>
            </p>
        </main>
    );
}
