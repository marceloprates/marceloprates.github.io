"use client";

/**
 * TopNav — site-wide sticky primary navigation.
 *
 * Five text items + a Search ⌘K button (palette wired in Phase F).
 *
 * Layout decisions (locked 2026-07-12, see .ralph/nav-redesign.md):
 *   - Sticky `top-0 z-40` so it stays available while scrolling.
 *   - Translucent backdrop-blur so content underneath reads through.
 *   - 56 px height: ≥ 44 pt HIG floor + 24×24 WCAG 2.5.8 touch
 *     target minimum. Touch targets are padded inside each link
 *     (h-11 = 44 px) so they comfortably exceed 24 px.
 *   - On viewports narrower than `md` (Tailwind 768 px), the five
 *     items collapse behind a hamburger button. The hamburger
 *     toggles `useState(open)`; pressing a nav link or the close
 *     button resets state. Pressing Esc does NOT close for now
 *     (the SearchPalette owns Esc in iter 4).
 *
 * Accessibility floor:
 *   - SkipLink already in <body> jumps to #main-content. The
 *     `#main-content` div carries `scroll-margin-top: 64px` in
 *     globals.css so focused elements are not hidden behind the
 *     sticky header (WCAG 2.4.11 Focus Not Obscured).
 *   - Active link carries `aria-current="page"`.
 *   - Hamburger button carries `aria-expanded` and `aria-controls`
 *     pointing at the nav list.
 *   - Focus-visible outline on every interactive element.
 *
 * Palette hook:
 *   - The Search button currently logs a sentinel — Phase F replaces
 *     this with a `usePaletteState()` call from src/components/nav/
 *     SearchPalette.tsx.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import { useCallback, useState } from "react";

export interface NavItem {
    /** Visible label. */
    readonly label: string;
    /** Internal route or query-prefixed route. */
    readonly href: string;
}

/**
 * Canonical nav item order. The list maps to the locked top-level IA
 * (see .ralph/nav-redesign.md Phase B):
 *   Projects · Writing · About · Resume.
 *
 * Post-loop refinement (2026-07-12): Open Source was removed because
 * it was just a /work?tag=open-source query filter, which surfaced a
 * confusing duplicate against the Projects link. The tag is still
 * reachable via the SearchPalette and the /work filter chips; only
 * the TopNav entry is gone.
 *
 * "Work" was renamed to "Projects" to match the user-facing
 * expectation (a "Projects" page is the conventional portfolio
 * surface). The route stays /work for now (renaming the URL would
 * break existing inbound links).
 */
export const NAV_ITEMS: readonly NavItem[] = [
    { label: "Projects", href: "/work" },
    { label: "Writing", href: "/posts" },
    { label: "About", href: "/about" },
    { label: "Resume", href: "/resume" },
] as const;

/**
 * Visual nav height (px). Used by globals.css scroll-margin-top and
 * by tests asserting layout.
 */
export const TOPNAV_HEIGHT_PX = 56;

function isActive(href: string, pathname: string): boolean {
    if (pathname === "/" && href === "/") return true;
    const [path, query] = href.split("?");
    if (path !== "/" && pathname !== path && !pathname.startsWith(path + "/")) {
        return false;
    }
    // For query-bearing links, don't claim active on plain pathname
    // matches — the /work page itself is owned by the "Work" link,
    // not the "Open Source" link.
    if (query) return false;
    return true;
}

export interface TopNavProps {
    /**
     * Called when the Search button is clicked. Wired to the cmdk
     * palette in Phase F. If omitted, the Search button is hidden.
     */
    onSearchClick?: () => void;
}

export function TopNav({ onSearchClick }: TopNavProps) {
    const pathname = usePathname() ?? "/";
    const [mobileOpen, setMobileOpen] = useState(false);

    const closeMobile = useCallback(() => setMobileOpen(false), []);

    return (
        <header
            data-testid="site-topnav"
            className="sticky top-0 inset-x-0 z-40 h-14 backdrop-blur bg-white/80 dark:bg-zinc-950/80 border-b border-black/5 dark:border-white/10"
        >
            <nav
                aria-label="Primary"
                className="h-full max-w-6xl mx-auto px-4 flex items-center justify-between"
            >
                <Link
                    href="/"
                    className="text-sm font-semibold tracking-tight text-gray-900 dark:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 rounded-sm"
                >
                    marceloprates
                </Link>

                <ul
                    id="primary-nav-list"
                    data-testid="primary-nav-list"
                    className={`${
                        mobileOpen ? "flex" : "hidden"
                    } md:flex absolute md:static left-0 right-0 top-14 md:top-auto flex-col md:flex-row items-stretch md:items-center gap-1 md:gap-2 px-4 md:px-0 py-2 md:py-0 bg-white/95 dark:bg-zinc-950/95 md:bg-transparent border-b md:border-0 border-black/5 dark:border-white/10`}
                >
                    {NAV_ITEMS.map((item) => {
                        const active = isActive(item.href, pathname);
                        return (
                            <li key={item.href} className="md:list-item">
                                <Link
                                    href={item.href}
                                    onClick={closeMobile}
                                    aria-current={active ? "page" : undefined}
                                    className={`inline-flex items-center justify-center w-full md:w-auto h-11 px-3 md:px-4 rounded-md text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 ${
                                        active
                                            ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-400/10"
                                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                <div className="flex items-center gap-1">
                    {onSearchClick && (
                        <button
                            type="button"
                            onClick={onSearchClick}
                            aria-label="Open search (Cmd+K)"
                            data-testid="search-button"
                            className="inline-flex items-center gap-2 h-11 px-3 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
                        >
                            <Search className="w-4 h-4" aria-hidden="true" />
                            <kbd className="hidden sm:inline-flex items-center text-xs font-mono rounded px-1.5 py-0.5 border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-white/5">
                                ⌘K
                            </kbd>
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => setMobileOpen((o) => !o)}
                        aria-expanded={mobileOpen}
                        aria-controls="primary-nav-list"
                        aria-label={mobileOpen ? "Close menu" : "Open menu"}
                        className="md:hidden inline-flex items-center justify-center h-11 w-11 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
                    >
                        {mobileOpen ? (
                            <X className="w-5 h-5" aria-hidden="true" />
                        ) : (
                            <Menu className="w-5 h-5" aria-hidden="true" />
                        )}
                    </button>
                </div>
            </nav>
        </header>
    );
}

export default TopNav;
