"use client";

import React from 'react';
import Image, { type StaticImageData } from 'next/image';
import Tilt from './Tilt';
import effects from './CardEffects.module.css';
import slashStyles from './TileButton.module.css';
import halftone from './Texture.module.css';

type ImageVariant = 'right-slashed' | 'full';

export interface CardImage {
    src?: string | StaticImageData;
    alt?: string;
    variant?: ImageVariant;
    priority?: boolean;
    sizes?: string;
}

export interface CardBaseProps {
    href?: string;
    external?: boolean;
    className?: string;
    contentClassName?: string;
    scale?: number;
    shine?: boolean;
    halftone?: boolean; // subtle paper texture overlay
    lines?: boolean; // diagonal line texture overlay
    image?: CardImage;
    overlayAriaLabel?: string;
    aspectRatio?: number; // width / height
    children: React.ReactNode;
}

// Shared base card with Tilt, optional shine, optional image (right-slashed or full), and a clickable overlay
export const BaseCard = React.memo(function BaseCard({
    href,
    external = false,
    className,
    contentClassName,
    scale = 1.04,
    shine = true,
    halftone: showHalftone = true,
    lines: showLines = false,
    image,
    overlayAriaLabel,
    children,
    aspectRatio,
}: CardBaseProps) {
    const containerClass = [
        'group relative rounded-2xl overflow-hidden bg-white/60 dark:bg-zinc-900/40 ring-1 ring-black/5 dark:ring-white/10 backdrop-blur-sm transition-shadow hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/30',
        className || '',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <Tilt className={containerClass} scale={scale} style={aspectRatio ? ({ aspectRatio } as React.CSSProperties) : undefined}>
            {/* Optional cursor-following shine */}
            {shine ? (
                <span
                    aria-hidden
                    className={`pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${effects.shine}`}
                />
            ) : null}

            {/* Optional halftone / microdot texture (comes after base bg, before images/content) */}
            {showHalftone ? <span aria-hidden className={halftone.halftone} /> : null}

            {/* Optional diagonal line texture */}
            {showLines ? <span aria-hidden className={halftone.lines} /> : null}

            {/* Optional background/side image */}
            {image?.src && image.variant === 'right-slashed' ? (
                <span
                    aria-hidden
                    className={`pointer-events-none absolute inset-y-0 right-0 w-1/2 ${slashStyles.imageRightClip}`}
                >
                    <Image
                        src={image.src}
                        alt={image.alt ?? ''}
                        fill
                        sizes={image.sizes ?? '(max-width: 768px) 50vw, 33vw'}
                        className="object-cover object-center opacity-100 will-change-transform"
                        priority={image.priority}
                    />
                    {/* fade edge for smoother blend */}
                    <span className="absolute inset-0 bg-gradient-to-l from-white/30 via-white/15 to-transparent dark:from-black/40 dark:via-black/20" />
                </span>
            ) : null}

            {image?.src && image.variant === 'full' ? (
                <span aria-hidden className="pointer-events-none absolute inset-0">
                    <Image
                        src={image.src}
                        alt={image.alt ?? ''}
                        fill
                        sizes={image.sizes ?? '100vw'}
                        className="object-cover object-center opacity-100 will-change-transform"
                        priority={image.priority}
                    />
                    {/* subtle overlay for contrast */}
                    <span className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent" />
                </span>
            ) : null}

            {/* Foreground content */}
            <div className={[
                'relative z-10 p-6 pointer-events-none',
                contentClassName || '',
            ].filter(Boolean).join(' ')}>
                {children}
            </div>

            {/* Clickable overlay beneath content (content has pointer-events-none) so the entire card is a link */}
            {href ? (
                <a
                    href={href}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noopener noreferrer' : undefined}
                    className="absolute inset-0 z-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black"
                    aria-label={overlayAriaLabel}
                />
            ) : null}
        </Tilt>
    );
});

export default BaseCard;
