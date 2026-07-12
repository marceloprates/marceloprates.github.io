import { Section } from '@/components/Section';
import { MiscCard } from '@/components/MiscCard';
import { getEnabledMiscEntries } from '@/data/misc';
import type { Metadata } from 'next';

/**
 * /misc index — discoverability surface for orphan routes.
 *
 * Renders every enabled entry from `src/data/misc.ts` as a `MiscCard`
 * in a responsive grid. Disabled entries stay in the registry but are
 * filtered out via `getEnabledMiscEntries()`.
 *
 * Adding a new entry:
 *   1. Append to src/data/misc.ts (the registry parses at module load)
 *   2. Set enabled: true to surface it on this page
 */
export const metadata: Metadata = {
    title: 'Misc — Marcelo Prates',
    description:
        'Miscellaneous pages, references, and side projects that don\u2019t fit in the main resume-style narrative.',
};

export default function MiscIndexPage() {
    const entries = getEnabledMiscEntries();

    return (
        <main className="px-4 py-16 mx-auto max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Misc</h1>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 mb-12 max-w-2xl">
                Smaller pages and references that don&apos;t fit on the main home page — kept
                here for posterity and discoverability.
            </p>
            <Section
                id="misc-entries"
                title="Pages"
                gradient="from-purple-500 via-fuchsia-500 to-pink-500"
                as="h2"
            >
                {entries.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 italic">
                        No entries enabled right now.
                    </p>
                ) : (
                    <div className="grid gap-4">
                        {entries.map((entry) => (
                            <MiscCard key={entry.id} entry={entry} />
                        ))}
                    </div>
                )}
            </Section>
        </main>
    );
}
