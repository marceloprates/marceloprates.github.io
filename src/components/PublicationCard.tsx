"use client";

import React from 'react';
import type { Publication } from '@/types';
import BaseCard from './BaseCard';

// Venue categories with saturated gradients (aligned with top tile palette)
// Using !bg-transparent later to remove BaseCard's default translucent background.
const venueStyles = {
    'AAAI': {
        bg: 'bg-gradient-to-br from-red-400 via-orange-400 to-amber-300',
        accent: 'from-red-200 to-amber-100'
    },
    'IJCAI': {
        bg: 'bg-gradient-to-br from-violet-400 via-fuchsia-400 to-purple-400',
        accent: 'from-fuchsia-100 to-purple-100'
    },
    'ICANN': {
        bg: 'bg-gradient-to-br from-sky-400 via-blue-400 to-indigo-400',
        accent: 'from-sky-100 to-indigo-100'
    },
    'ICTAI': {
        bg: 'bg-gradient-to-br from-emerald-400 via-green-400 to-teal-300',
        accent: 'from-emerald-100 to-teal-100'
    },
    'ICONIP': {
        bg: 'bg-gradient-to-br from-cyan-400 via-sky-400 to-blue-400',
        accent: 'from-cyan-100 to-sky-100'
    },
    'GCAI': {
        bg: 'bg-gradient-to-br from-amber-400 via-yellow-400 to-lime-300',
        accent: 'from-amber-100 to-lime-100'
    },
    'Journal': {
        bg: 'bg-gradient-to-br from-rose-400 via-pink-400 to-fuchsia-400',
        accent: 'from-rose-100 to-pink-100'
    },
    'HCOMP': {
        bg: 'bg-gradient-to-br from-purple-400 via-violet-400 to-indigo-400',
        accent: 'from-violet-100 to-indigo-100'
    },
    'default': {
        bg: 'bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400',
        accent: 'from-emerald-100 to-cyan-100'
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
                    <span className="pointer-events-auto text-sm md:text-base tracking-wide font-semibold text-black/85">{`Cited by ${publication.citations}`}</span>
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
