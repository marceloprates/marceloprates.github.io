import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { MiscEntry } from '@/data/misc-schema';

/**
 * Single card on the `/misc` index. Whole card is one link to the
 * misc route. Server component (no client state).
 *
 * Visual contract:
 *   - icon at top-left (optional, 32x32)
 *   - title (1 line, bold, gradient text)
 *   - description (1-3 lines, muted, line-clamp-3)
 *   - arrow icon at right (visual affordance that this is a link)
 *   - hover: subtle lift via shadow + ring color
 *
 * Accessibility:
 *   - card is a single `<a>`, keyboard-focusable by default
 *   - title is visually the accessible name
 *   - description is plain text (screen-reader-friendly)
 */
interface MiscCardProps {
    entry: MiscEntry;
}

export const MiscCard = React.memo(function MiscCard({ entry }: MiscCardProps) {
    return (
        <a
            href={entry.href}
            className="group relative block rounded-2xl bg-white/60 dark:bg-zinc-900/40 ring-1 ring-black/5 dark:ring-white/10 backdrop-blur-sm p-6 transition-all hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/30 hover:ring-black/10 dark:hover:ring-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
            <div className="flex items-start gap-4">
                {entry.icon && (
                    <div className="shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center ring-1 ring-black/5 dark:ring-white/10">
                        {/* Plain img: Next/Image is not configured for static export */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={entry.icon}
                            alt=""
                            width={20}
                            height={20}
                            className="invert dark:invert-0 opacity-90"
                            loading="lazy"
                        />
                    </div>
                )}
                <div className="min-w-0 flex-1">
                    <h2 className="text-lg md:text-xl font-semibold mb-1 text-gray-900 dark:text-white tracking-tight">
                        {entry.title}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
                        {entry.description}
                    </p>
                </div>
                <ArrowRight
                    className="shrink-0 w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all mt-1"
                    aria-hidden="true"
                />
            </div>
            {entry.category && (
                <span className="absolute top-3 right-3 text-[10px] uppercase tracking-wider font-medium text-gray-400 dark:text-gray-500">
                    {entry.category}
                </span>
            )}
        </a>
    );
});

export default MiscCard;
