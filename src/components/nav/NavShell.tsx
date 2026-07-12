"use client";

/**
 * NavShell — client wrapper that owns the shared state between
 * TopNav and SearchPalette:
 *   - `searchOpen: boolean`
 *   - global keyboard listener for ⌘K (and Ctrl+K) toggles it
 *   - the trigger element ref so focus can return on close
 *
 * Why a wrapper:
 *   - Next 15 layout.tsx is a Server Component. Promoting it to a
 *     client component just to hold one piece of state would
 *     trigger a client boundary much higher than necessary
 *     (defeats the static export).
 *   - Lifting state into <Providers> would couple Providers to the
 *     nav. A standalone NavShell keeps the concern isolated.
 *
 * Items source:
 *   - The `items` prop is built server-side in
 *     src/lib/search-items.server.ts (called from layout.tsx).
 *     This file does NOT import fs-backed modules — Webpack would
 *     fail to bundle them for the browser. Phase F replaces the
 *     resolver body with a fetch against /search-index.json so the
 *     data stays fresh on content changes.
 */

import { useCallback, useEffect, useRef, useState } from "react";

import { TopNav } from "@/components/nav/TopNav";
import {
    SearchPalette,
    type SearchableItem,
} from "@/components/nav/SearchPalette";

export interface NavShellProps {
    /** Pre-built search index (server-side). */
    items: readonly SearchableItem[];
}

export function NavShell({ items }: NavShellProps) {
    const [searchOpen, setSearchOpen] = useState(false);
    const triggerRef = useRef<HTMLElement | null>(null);

    const open = useCallback(() => {
        // Capture the focused element so we can restore on close.
        triggerRef.current = document.activeElement as HTMLElement | null;
        setSearchOpen(true);
    }, []);

    const close = useCallback(() => {
        setSearchOpen(false);
        // Restore focus to whatever opened the palette (typically the
        // Search button in the top nav) so keyboard users don't lose
        // their place.
        const t = triggerRef.current;
        if (t && typeof t.focus === "function") {
            window.setTimeout(() => t.focus(), 0);
        }
    }, []);

    // Global ⌘K / Ctrl+K listener.
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const k = e.key.toLowerCase();
            if ((e.metaKey || e.ctrlKey) && k === "k") {
                e.preventDefault();
                setSearchOpen((o) => (o ? false : true));
                triggerRef.current = document.activeElement as HTMLElement | null;
                return;
            }
            // Slash also opens the palette (GitHub-style).
            if (!searchOpen && k === "/" && !isTypingTarget(e.target)) {
                e.preventDefault();
                triggerRef.current = document.activeElement as HTMLElement | null;
                setSearchOpen(true);
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [searchOpen]);

    return (
        <>
            <TopNav onSearchClick={open} />
            <SearchPalette
                open={searchOpen}
                onClose={close}
                items={items}
            />
        </>
    );
}

/**
 * True when the focused element is a typing target (input, textarea,
 * contenteditable). Prevents the `/` shortcut from hijacking the
 * slash character while someone types.
 */
function isTypingTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;
    const tag = target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return true;
    if (target.isContentEditable) return true;
    return false;
}

