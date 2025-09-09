"use client";

import React from 'react';
import styles from './StarshipCard.module.css';
import starshipImg from '../../assets/starship.png';
import BaseCard from './BaseCard';

interface StarshipCardProps {
    href?: string;
}

// Terminal-styled project card for sharing the Starship prompt theme
export const StarshipCard = React.memo(function StarshipCard({ href = '#' }: StarshipCardProps) {
    const link = href === '#' ? '/starship' : href;
    const width = (starshipImg as { width: number }).width;
    const height = (starshipImg as { height: number }).height;
    const ratio = width && height ? width / height : undefined;
    return (
        <BaseCard
            href={link}
            overlayAriaLabel="View my Starship theme"
            className="bg-transparent shadow-lg hover:shadow-xl hover:shadow-black/20 ring-1 ring-black/10 dark:ring-white/10"
            contentClassName="p-5"
            image={{ src: starshipImg, variant: 'full', priority: true }}
            shine={false}
            aspectRatio={ratio}
        >
            {/* Background FX */}
            <div aria-hidden className={styles.shine} />
            <div aria-hidden className={styles.scanlines} />
            {/* Caption */}
            <div className="absolute top-12 left-4 right-4 pointer-events-auto">
                <p className="text-xs text-white/80 drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">
                    {'>'} My personal Starship prompt, tailored for data science workflows.
                </p>
            </div>
        </BaseCard>
    );
});

export default StarshipCard;
