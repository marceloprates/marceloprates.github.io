"use client";

import React from 'react';
import type { Publication } from '@/types';
import BaseCard from './BaseCard';

interface PublicationCardProps {
    publication: Publication;
}

export const PublicationCard = React.memo(function PublicationCard({ publication }: PublicationCardProps) {
    return (
        <BaseCard
            href={publication.url}
            external
            overlayAriaLabel={publication.title}
        >
            <h3 className="font-semibold mb-2 text-gray-900 dark:text-white flex items-start gap-2 text-lg md:text-xl">
                <span className="inline-block w-1.5 h-5 rounded-full bg-gradient-to-b from-emerald-500 to-cyan-500 group-hover:scale-y-110 transition-transform" />
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
