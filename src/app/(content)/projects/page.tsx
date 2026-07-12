import { Suspense } from "react";
import type { Metadata } from "next";

import { getWorkProjects } from "@/lib/work-projects";
import { getProjectMetadata } from "@/lib/project-metadata.server";
import { resolveProjectLinks } from "@/lib/projects";
import { WorkGrid } from "@/components/work/WorkGrid";

/**
 * /projects — unified, faceted grid of every project.
 *
 * Server Component. Reads ?primary=...&tag=... once at request
 * time and threads the parsed values into <WorkGrid> as
 * `initial=` (the client takes over URL sync after hydration).
 *
 * SEO: <h1>Projects</h1>, metadata.title = "Projects — Marcelo Prates".
 *
 * Why Suspense: useSearchParams() inside <WorkGrid> needs it under
 * Next 15 static export rules (the page is pre-rendered, and the
 * search params are read at request time on the client). The
 * fallback is empty so the layout holds while the grid hydrates.
 */

export const metadata: Metadata = {
    title: "Projects — Marcelo Prates",
    description:
        "All projects, filterable by category (Code · Art · Writing · Experiments) and tag (open-source, ml, threejs, ...).",
};

/**
 * The /projects page is rendered statically. The URL search params
 * (`?primary=...&tag=...`) are not known at build time, so the
 * server-rendered HTML always starts with `initial = {primary: all,
 * tag: null}`. The client component (WorkGrid) reads useSearchParams
 * to apply the actual filter on hydration.
 *
 * Without `force-static`, Next 15 + `output: 'export'` would refuse
 * to pre-render the page because we await searchParams.
 */
export const dynamic = "force-static";

export default function ProjectsPage() {
    // No need to read searchParams at all in the Server Component —
    // WorkGrid derives the active filter from useSearchParams() on
    // the client. We pass the always-empty initial here.
    const initial = { primary: "all" as const, tag: null };
    // Resolve all project links server-side so the URL is the same
    // in SSR HTML and the client render. This avoids a hydration
    // mismatch where the previous resolver consulted a window-
    // injected metadata map that only existed on the client.
    const metadata = getProjectMetadata();
    const projects = resolveProjectLinks(getWorkProjects(), metadata);

    return (
        <main className="px-4 py-16 mx-auto max-w-6xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                Projects
            </h1>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 mb-12 max-w-2xl">
                Every project — generative art, dev tools, experiments,
                writing — filterable by primary category and tag.
            </p>

            <Suspense
                fallback={
                    <p className="text-sm text-gray-500">Loading filters…</p>
                }
            >
                <WorkGrid projects={projects} initial={initial} />
            </Suspense>
        </main>
    );
}
