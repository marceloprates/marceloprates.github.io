"use client";

/**
 * SearchPalette — ⌘K command palette (powered by cmdk + Fuse.js).
 *
 * Use:
 *   <SearchPalette open={bool} onClose={() => ...} items={...} />
 *
 * The component is controlled: `open` reflects the parent's state;
 * `onClose` is called on backdrop click, Esc, or after a successful
 * selection. The Global ⌘K listener lives in NavShell (so the
 * palette itself stays dumb and easy to test under jsdom).
 *
 * Search model (Fuse.js):
 *   - keys: title (weighted 0.6), desc (0.1), tags (0.3)
 *   - threshold 0.3 — softer than cmdk's exact-ish default, lets
 *     "map" match "prettymaps".
 *   - results grouped by `type` (Project | Post | Page).
 *
 * Accessibility floor:
 *   - role="dialog" + aria-modal="true"
 *   - focus moves to the input on open; back-button (Esc) returns
 *     focus to the trigger via NavShell's captured ref.
 *   - Each Command.Item is a button with role="option" inside the
 *     listbox (cmdk handles the ARIA plumbing).
 */

import { Command } from "cmdk";
import Fuse from "fuse.js";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";


type SearchableItemType = "project" | "post" | "page";

export interface SearchableItem {
    /** Stable id, used as cmdk Command.Item key. */
    id: string;
    /** Primary text. Weighted highest by Fuse. */
    title: string;
    /** Optional one-line description shown under the title. */
    desc?: string;
    /** Optional comma-separated tags. Weighted mid by Fuse. */
    tags?: readonly string[];
    /** Destination, internal or absolute. */
    href: string;
    /** Drives the Command.Group heading. */
    type: SearchableItemType;
}

const GROUP_ORDER: SearchableItemType[] = ["project", "post", "page"];
const GROUP_LABEL: Record<SearchableItemType, string> = {
    project: "Projects",
    post: "Writing",
    page: "Pages",
};

export interface SearchPaletteProps {
    /** Controlled visibility. */
    open: boolean;
    /** Called when the user dismisses the palette. */
    onClose: () => void;
    /** Searchable items. Static for the lifetime of the open state. */
    items: readonly SearchableItem[];
    /** Optional className for the dialog panel. */
    className?: string;
}

const FUSE_OPTIONS: ConstructorParameters<typeof Fuse<SearchableItem>>[1] = {
    keys: [
        { name: "title", weight: 0.6 },
        { name: "desc", weight: 0.1 },
        { name: "tags", weight: 0.3 },
    ],
    threshold: 0.3,
    ignoreLocation: true,
    includeScore: false,
};

export function SearchPalette({
    open,
    onClose,
    items,
    className,
}: SearchPaletteProps) {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const dialogRef = useRef<HTMLDivElement>(null);

    const fuse = useMemo(
        () => new Fuse<SearchableItem>([...items], FUSE_OPTIONS),
        [items],
    );
    const [query, setQuery] = useState("");
    const filtered = useMemo(() => {
        const q = query.trim();
        if (!q) return [...items];
        return fuse.search(q).map((r) => r.item);
    }, [query, items, fuse]);

    // Focus the input on open. CmDK handles ArrowUp/Down/Enter/Backspace
    // internally; we only handle Esc at the wrapper level so the palette
    // doesn't fight the underlying top nav.
    useEffect(() => {
        if (open) {
            const t = window.setTimeout(() => inputRef.current?.focus(), 30);
            return () => window.clearTimeout(t);
        }
        return undefined;
    }, [open]);

    useEffect(() => {
        if (!open) return undefined;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault();
                onClose();
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [open, onClose]);

    if (!open) return null;

    const handleSelect = (item: SearchableItem) => {
        onClose();
        // Defer router.push so the close animation (if any) finishes
        // first. The router itself does not animate.
        window.setTimeout(() => router.push(item.href), 0);
    };

    return (
        <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[10vh] px-4"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
            role="presentation"
        >
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-label="Site search"
                data-testid="search-palette"
                onMouseDown={(e) => e.stopPropagation()}
                className={
                    "w-full max-w-xl bg-white dark:bg-zinc-900 rounded-xl shadow-2xl overflow-hidden ring-1 ring-black/10 dark:ring-white/10 " +
                    (className ?? "")
                }
            >
                <Command
                    label="Site search"
                    shouldFilter={false}
                    className="flex flex-col"
                >
                    <Command.Input
                        ref={inputRef}
                        value={query}
                        onValueChange={setQuery}
                        placeholder="Search projects, posts, pages…"
                        className="w-full px-4 py-3 text-base bg-transparent border-b border-black/10 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none"
                    />
                    <Command.List className="max-h-[60vh] overflow-y-auto py-2">
                        <Command.Empty className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                            No results found.
                        </Command.Empty>
                        {GROUP_ORDER.map((group) => {
                            const groupItems = filtered.filter((i) => i.type === group);
                            if (groupItems.length === 0) return null;
                            return (
                                <Command.Group
                                    key={group}
                                    heading={GROUP_LABEL[group]}
                                    className="px-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-gray-500 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
                                >
                                    {groupItems.map((item) => (
                                        <Command.Item
                                            key={item.id}
                                            value={`${item.title} ${item.desc ?? ""} ${(item.tags ?? []).join(" ")}`}
                                            onSelect={() => handleSelect(item)}
                                            data-testid={`search-result-${item.id}`}
                                            className="px-3 py-2 mx-1 rounded-md cursor-pointer aria-selected:bg-blue-50 aria-selected:text-blue-900 dark:aria-selected:bg-blue-400/10 dark:aria-selected:text-blue-200"
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">{item.title}</span>
                                                {item.desc && (
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                                        {item.desc}
                                                    </span>
                                                )}
                                            </div>
                                        </Command.Item>
                                    ))}
                                </Command.Group>
                            );
                        })}
                    </Command.List>
                </Command>
            </div>
        </div>
    );
}

