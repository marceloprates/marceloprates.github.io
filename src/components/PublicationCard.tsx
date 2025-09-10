"use client";

import React from 'react';
import type { Publication } from '@/types';
import BaseCard from './BaseCard';

// Venue categories and their gradient colors (more subtle for backgrounds)
const venueStyles = {
    'AAAI': {
        bg: 'bg-gradient-to-br from-red-100/80 to-orange-100/80 dark:from-red-950/40 dark:to-orange-950/40',
        accent: 'from-red-500 to-orange-500'
    },
    'IJCAI': {
        bg: 'bg-gradient-to-br from-purple-100/80 to-pink-100/80 dark:from-purple-950/40 dark:to-pink-950/40',
        accent: 'from-purple-500 to-pink-500'
    },
    'ICANN': {
        bg: 'bg-gradient-to-br from-blue-100/80 to-indigo-100/80 dark:from-blue-950/40 dark:to-indigo-950/40',
        accent: 'from-blue-500 to-indigo-500'
    },
    'ICTAI': {
        bg: 'bg-gradient-to-br from-green-100/80 to-emerald-100/80 dark:from-green-950/40 dark:to-emerald-950/40',
        accent: 'from-green-500 to-emerald-500'
    },
    'ICONIP': {
        bg: 'bg-gradient-to-br from-sky-100/80 to-blue-100/80 dark:from-sky-950/40 dark:to-blue-950/40',
        accent: 'from-sky-500 to-blue-500'
    },
    'GCAI': {
        bg: 'bg-gradient-to-br from-amber-100/80 to-yellow-100/80 dark:from-amber-950/40 dark:to-yellow-950/40',
        accent: 'from-amber-500 to-yellow-500'
    },
    'Journal': {
        bg: 'bg-gradient-to-br from-rose-100/80 to-pink-100/80 dark:from-rose-950/40 dark:to-pink-950/40',
        accent: 'from-rose-500 to-pink-500'
    },
    'HCOMP': {
        bg: 'bg-gradient-to-br from-violet-100/80 to-purple-100/80 dark:from-violet-950/40 dark:to-purple-950/40',
        accent: 'from-violet-500 to-purple-500'
    },
    'default': {
        bg: 'bg-gradient-to-br from-emerald-100/80 to-cyan-100/80 dark:from-emerald-950/40 dark:to-cyan-950/40',
        accent: 'from-emerald-500 to-cyan-500'
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
            className={style.bg}
        >
            <h3 className="font-semibold mb-2 text-gray-900 dark:text-white flex items-start gap-2 text-lg md:text-xl">
                <span className={`inline-block w-1.5 h-5 rounded-full bg-gradient-to-b ${style.accent} group-hover:scale-y-110 transition-transform`} />
                <a
                    href={publication.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pointer-events-auto hover:underline"
                >
                    {publication.title}
                </a>
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {publication.venue}
                <span className="mx-2">•</span>
                {publication.year}
            </p>
            <div className="relative z-10 flex items-center gap-4">
                {typeof publication.citations === 'number' && (
                    <span className="pointer-events-auto text-xs text-gray-600 dark:text-gray-300">{`Cited by ${publication.citations}`}</span>
                )}
                <div className="flex-1" />
                {publication.pdfUrl && (
                    <a
                        href={publication.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pointer-events-auto text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                    >
                        PDF
                    </a>
                )}
                <a
                    href={publication.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pointer-events-auto text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                    Details →
                </a>
            </div>
        </BaseCard>
    );
});

export default PublicationCard;
