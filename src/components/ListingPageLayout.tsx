import React from "react";
import { Section } from "./Section";

/**
 * Shared layout for content listing pages (/posts, /projects, future
 * content types). Wraps the page-level <main>, h1, optional lead
 * paragraph, and the inner Section primitive.
 *
 * Why this primitive exists:
 *   - posts/page.tsx and projects/page.tsx were copy-paste duplicates
 *     (just data source + card component differed).
 *   - Adding a third content type meant a third copy. Future content
 *     types (talks, publications, etc.) should compose this primitive
 *     with their own data + card.
 *
 * Visual contract:
 *   - <main> with px-4 py-16 mx-auto max-w-4xl (matches existing pages)
 *   - <h1> with text-4xl/5xl, mb-4
 *   - optional lead <p> with mb-12 max-w-2xl
 *   - inner <Section> with the supplied gradient (default blue/indigo/purple)
 *     and the title (rendered as <h2>)
 *   - children rendered inside the Section
 *
 * Server component (RSC). No client boundary.
 */

interface ListingPageLayoutProps {
    title: string;
    description?: string;
    gradient?: string;
    children: React.ReactNode;
}

export const ListingPageLayout = React.memo(function ListingPageLayout({
    title,
    description,
    gradient = "from-blue-500 via-indigo-500 to-purple-500",
    children,
}: ListingPageLayoutProps) {
    return (
        <main className="px-4 py-16 mx-auto max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                {title}
            </h1>
            {description && (
                <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 mb-12 max-w-2xl">
                    {description}
                </p>
            )}
            <Section id="listing" title={title} gradient={gradient} as="h2">
                {children}
            </Section>
        </main>
    );
});

export default ListingPageLayout;