import type { Metadata } from "next";
import Link from "next/link";

import { About } from "@/components/sections/About";

/**
 * /about — full About page.
 *
 * Phase E of nav-redesign. The home page retains a thin #about
 * anchor that surfaces the same component; this dedicated route
 * is now the canonical "About" destination (linked from the
 * TopNav).
 *
 * Composes the existing <About /> section component (which
 * delegates to the visual <AboutSection>). Adding a back-to-home
 * link above the title keeps the page useful in isolation.
 */
export const metadata: Metadata = {
    title: "About — Marcelo Prates",
    description:
        "Background, education, career, interests. Marcelo Prates is a Brazilian data scientist and ML engineer.",
};

export default function AboutPage() {
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
                About
            </h1>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 mb-12 max-w-2xl">
                Brazilian data scientist and ML engineer. PhD in CS
                (UFRGS, 2019). Based in Porto Alegre.
            </p>

            {/* AboutSection lives in src/components and is wrapped by
                 the About section component for siteConfig injection. */}
            <About />
        </main>
    );
}
