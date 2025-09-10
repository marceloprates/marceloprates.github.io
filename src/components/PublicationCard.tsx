"use client";

import React from 'react';
import type { Publication } from '@/types';
import BaseCard from './BaseCard';

// Venue categories with saturated gradients (aligned with top tile palette)
// Using !bg-transparent later to remove BaseCard's default translucent background.
const venueStyles = {
    'AAAI': {
        bg: 'bg-gradient-to-br from-red-500 via-orange-500 to-amber-400',
        accent: 'from-red-300 to-amber-200'
    },
    'IJCAI': {
        bg: 'bg-gradient-to-br from-violet-500 via-fuchsia-500 to-purple-500',
        accent: 'from-fuchsia-200 to-purple-200'
    },
    'ICANN': {
        bg: 'bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-500',
        accent: 'from-sky-200 to-indigo-200'
    },
    'ICTAI': {
        bg: 'bg-gradient-to-br from-emerald-500 via-green-500 to-teal-400',
        accent: 'from-emerald-200 to-teal-200'
    },
    'ICONIP': {
        bg: 'bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-500',
        accent: 'from-cyan-200 to-sky-200'
    },
    'GCAI': {
        bg: 'bg-gradient-to-br from-amber-500 via-yellow-500 to-lime-400',
        accent: 'from-amber-200 to-lime-200'
    },
    'Journal': {
        bg: 'bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-500',
        accent: 'from-rose-200 to-pink-200'
    },
    'HCOMP': {
        bg: 'bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-500',
        accent: 'from-violet-200 to-indigo-200'
    },
    'default': {
        bg: 'bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500',
        accent: 'from-emerald-200 to-cyan-200'
    }
};

function getVenueStyle(venue: string): typeof venueStyles['default'] {
    if (venue.includes('AAAI')) return venueStyles.AAAI;
    if (venue.includes('International Joint Conference on Artificial Intelligence')) return venueStyles.IJCAI;
    if (venue.includes('Neural Networks')) return venueStyles.ICANN;
    if (venue.includes('Tools with Artificial Intelligence')) return venueStyles.ICTAI;
    if (venue.includes('Neural Information Processing')) return venueStyles.ICONIP;
    if (venue.includes('Global Conference on Artificial Intelligence')) return venueStyles.GCAI;
    if (venue.includes('Computing & applications') || venue.toLowerCase().includes('journal')) return venueStyles.Journal;
    if (venue.includes('Human Computation')) return venueStyles.HCOMP;
    return venueStyles.default;
}

interface PublicationCardProps {
    publication: Publication;
}

export const PublicationCard = React.memo(function PublicationCard({ publication }: PublicationCardProps) {
    const style = getVenueStyle(publication.venue);

    return (
        <BaseCard
            href={publication.url}
            external
            overlayAriaLabel={publication.title}
            lines
            className={`!bg-transparent ${style.bg} text-black shadow-md ring-0`} // remove base bg & ring to show vivid gradient
        >
            <h3 className="font-semibold mb-3 flex items-start gap-2 text-lg md:text-xl leading-snug">
                <span className={`inline-block w-1.5 h-6 rounded-full bg-gradient-to-b ${style.accent} group-hover:scale-y-110 transition-transform`} />
                <a
                    href={publication.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pointer-events-auto !text-black visited:!text-black focus:!text-black hover:underline decoration-2 decoration-white/40 underline-offset-2"
                >
                    {publication.title}
                </a>
            </h3>
            <p className="text-sm font-medium text-black/90 mb-4">
                {publication.venue}
                <span className="mx-2">•</span>
                {publication.year}
            </p>
            <div className="relative z-10 flex items-center gap-4">
                {typeof publication.citations === 'number' && (
                    <span className="pointer-events-auto text-xs tracking-wide text-black/80">{`Cited by ${publication.citations}`}</span>
                )}
                <div className="flex-1" />
                {publication.pdfUrl && (
                    <a
                        href={publication.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pointer-events-auto !text-black visited:!text-black focus:!text-black text-xs md:text-sm font-semibold hover:underline"
                        onClick={(e) => e.stopPropagation()}
                    >
                        PDF
                    </a>
                )}
                <a
                    href={publication.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pointer-events-auto !text-black visited:!text-black focus:!text-black text-xs md:text-sm font-semibold hover:underline"
                >
                    Details →
                </a>
            </div>
        </BaseCard>
    );
});

export default PublicationCard;
