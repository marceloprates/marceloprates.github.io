"use client";

import Image from 'next/image';
import { Tile, BackLine, BackItem } from '@/types';
import { spanClasses } from '@/data/tiles';
import styles from './TileButton.module.css';
import gradients from './TileGradients.module.css';
import Tilt from './Tilt';
import effects from './CardEffects.module.css';
import React, { useState } from 'react';
import { showToast } from './toast';

interface TileButtonProps {
    tile: Tile;
    /**
     * Vertical growth percent applied when flipped.
     * Supported values: 0, 5, 10, 15, 20, 25, 30, 40, 50.
     * Default: 25
     */
    flipGrowPercent?: 0 | 5 | 10 | 15 | 20 | 25 | 30 | 40 | 50;
}

export function TileButton({ tile, flipGrowPercent = 25 }: TileButtonProps) {
    const [isFlipped, setIsFlipped] = useState(false);
    const gradClass = tile.gradientClass ? (gradients as Record<string, string>)[tile.gradientClass] : '';
    const growClassKey = `flipGrow${flipGrowPercent}` as const;
    const growClass = (styles as Record<string, string>)[growClassKey] || '';

    const openHref = () => {
        if (!tile.href) return;
        // internal section links (#section) → smooth scroll
        if (tile.href.startsWith('#')) {
            // special case: '#' → scroll to top and exit
            if (tile.href === '#') {
                try {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } catch {
                    // no-op
                }
                return;
            }
            try {
                const el = document.querySelector(tile.href);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            } catch {
                // ignore invalid selectors
            }
            return;
        }
        // external/internal route → navigate in same tab
        window.location.href = tile.href;
    };

    const handleClick = (e: React.MouseEvent) => {
        // Allow modified clicks to behave like links (new tab, etc.)
        if (tile.clickBehavior !== 'flip') {
            // default: scroll/link
            if (e.button === 1 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // let browser handle
            e.preventDefault();
            e.stopPropagation();
            openHref();
            return;
        }

        // Flip behavior
        e.preventDefault();
        e.stopPropagation();
        setIsFlipped(!isFlipped);
    };

    // Render helper: accepts strings, BackLine, { html }, or ReactNode
    const renderBackLine = (input: BackItem, idx?: number) => {
        if (input == null) return null;

        // Raw HTML path
        if (typeof input === 'object' && input !== null && 'html' in input) {
            return (
                <div
                    key={idx}
                    className="[&_*]:align-middle"
                    dangerouslySetInnerHTML={{ __html: input.html }}
                    onClick={(e) => e.stopPropagation()}
                />
            );
        }

        // Structured object path
        if (typeof input === 'object' && input !== null && 'text' in input) {
            const { text, href, type } = input as BackLine;
            // special handling for email copy behavior
            if (type === 'email') {
                const email = href || text;
                const handleCopy = async (e: React.MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    try {
                        await navigator.clipboard.writeText(email);
                        showToast('Email copied to clipboard');
                    } catch {
                        const ta = document.createElement('textarea');
                        ta.value = email;
                        ta.style.position = 'fixed';
                        ta.style.left = '-9999px';
                        document.body.appendChild(ta);
                        ta.select();
                        try {
                            document.execCommand('copy');
                            showToast('Email copied to clipboard');
                        } catch {
                            showToast('Could not copy email');
                        }
                        ta.remove();
                    }
                };
                return (
                    <a
                        key={idx}
                        href="#"
                        className="no-underline transition-colors duration-150 hover:text-amber-200 focus-visible:text-amber-200 hover:opacity-90"
                        onClick={handleCopy}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                (e.target as HTMLElement).click();
                            }
                        }}
                        role="button"
                        tabIndex={0}
                    >
                        <span className="font-nerd mr-1">󰊫 </span>
                        {text}
                    </a>
                );
            }

            if (href) {
                return (
                    <a
                        key={idx}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="no-underline transition-colors duration-150 hover:text-amber-200 focus-visible:text-amber-200 hover:opacity-90"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {text}
                    </a>
                );
            }
            return <span key={idx}>{text}</span>;
        }

        // String path: linkify common patterns (email, URLs, and "linkedin <handle>")
        if (typeof input !== 'string') {
            // Treat as ReactNode (e.g., JSX element)
            return <span key={idx}>{input as React.ReactNode}</span>;
        }
        const raw = input;
        const line = raw.trim();
        // mailto
        const emailMatch = line.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
        if (emailMatch) {
            const email = emailMatch[0];
            const handleCopy = async (e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                try {
                    await navigator.clipboard.writeText(email);
                    showToast('Email copied to clipboard');
                } catch {
                    // fallback: create a temporary textarea
                    const ta = document.createElement('textarea');
                    ta.value = email;
                    ta.style.position = 'fixed';
                    ta.style.left = '-9999px';
                    document.body.appendChild(ta);
                    ta.select();
                    try {
                        document.execCommand('copy');
                        showToast('Email copied to clipboard');
                    } catch {
                        showToast('Could not copy email');
                    }
                    ta.remove();
                }
            };

            return (
                <a
                    key={idx}
                    href={`#`}
                    className="no-underline transition-colors duration-150 hover:text-amber-200 focus-visible:text-amber-200 hover:opacity-90"
                    onClick={handleCopy}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            (e.target as HTMLElement).click();
                        }
                    }}
                    role="button"
                    tabIndex={0}
                >
                    <span className="font-nerd mr-1">󰊫 </span>
                    {email.replace(/@gmail\.com$/i, '')}
                </a>
            );
        }

        // explicit URL
        const urlMatch = line.match(/https?:\/\/\S+/i);
        if (urlMatch) {
            const url = urlMatch[0];
            return (
                <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="no-underline transition-colors duration-150 hover:text-amber-200 focus-visible:text-amber-200 hover:opacity-90"
                    onClick={(e) => e.stopPropagation()}
                >
                    {line}
                </a>
            );
        }

        // linkedin handle: e.g., "linkedin marceloprates" or "LinkedIn @marceloprates"
        const liMatch = line.match(/^linkedin\s+(@?[-\w\.]+)$/i);
        if (liMatch) {
            const handle = liMatch[1].replace(/^@/, '');
            const url = `https://www.linkedin.com/in/${handle}`;
            return (
                <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="no-underline transition-colors duration-150 hover:text-amber-200 focus-visible:text-amber-200 hover:opacity-90"
                    onClick={(e) => e.stopPropagation()}
                >
                    <span className="font-nerd mr-1"> </span>{handle}
                </a>
            );
        }

        // github handle: e.g., "github marceloprates" or "GitHub @marceloprates"
        const ghMatch = line.match(/^github\s+(@?[-\w\.]+)$/i);
        if (ghMatch) {
            const handle = ghMatch[1].replace(/^@/, '');
            const url = `https://github.com/${handle}`;
            return (
                <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="no-underline transition-colors duration-150 hover:text-amber-200 focus-visible:text-amber-200 hover:opacity-90"
                    onClick={(e) => e.stopPropagation()}
                >
                    <span className="font-nerd mr-1"> </span>{handle}
                </a>
            );
        }

        // default plain text
        return <span key={idx}>{line}</span>;
    };

    return (
        <div className={`group ${styles.gridItem} ${isFlipped ? styles.isActive : ''}`}>
            <Tilt className={`relative block overflow-visible ${styles.flipContainer}`} scale={1.05}>
                <div
                    className={`${styles.flipCard} ${growClass} ${isFlipped ? styles.flipped : ''}`}
                    onClick={handleClick}
                    role="button"
                    tabIndex={0}
                    aria-label={tile.label}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            (e.currentTarget as HTMLElement).click();
                        }
                    }}
                >
                    {/* Front side */}
                    <div className={`${styles.flipCardFront}`}>
                        <div
                            className={`relative block p-6 overflow-hidden rounded-lg shadow-lg cursor-pointer transform-gpu transition-shadow hover:shadow-xl ${spanClasses[tile.variant]} ${gradClass}`}
                        >
                            {/* cursor-following shine */}
                            <span
                                aria-hidden
                                className={`pointer-events-none absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${effects.shine}`}
                            />
                            {/* Left content over gradient */}
                            <span className="relative z-10 text-white font-semibold text-lg md:text-xl drop-shadow-sm tracking-tight">
                                {tile.label}
                            </span>

                            {/* Right illustration with diagonal slash clip */}
                            {tile.image && (
                                <span
                                    aria-hidden
                                    className={`absolute inset-y-0 right-0 w-1/2 z-0 ${styles.imageRightClip} opacity-90`}
                                >
                                    <Image
                                        src={tile.image}
                                        alt=""
                                        fill
                                        sizes="(max-width: 768px) 50vw, 33vw"
                                        className="object-cover object-center opacity-100 will-change-transform"
                                        priority={tile.variant === 'lg'}
                                    />
                                    {/* subtle gradient fade to blend image edge (use light fade on bright themes) */}
                                    <span className="absolute inset-0 bg-gradient-to-l from-white/20 via-white/10 to-transparent dark:from-black/40 dark:via-black/20" />
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Back side - mirror the front gradient/color */}
                    <div className={`${styles.flipCardBack} ${gradClass || styles.flipCardBackNeutral}`}>
                        {/* Back content */}
                        <div className="relative block h-full p-4 flex items-center justify-center">
                            {tile.backContent && (
                                <div className="text-white text-justify text-center font-medium leading-snug drop-shadow-sm">
                                    {Array.isArray(tile.backContent)
                                        ? (tile.backContent as BackItem[]).map((line, idx) => (
                                            <div key={idx}>{renderBackLine(line, idx)}</div>
                                        ))
                                        : (
                                            typeof tile.backContent === 'string'
                                                ? tile.backContent
                                                    .split(/\r?\n/)
                                                    .map((line, idx) => (
                                                        <div key={idx}>{renderBackLine(line, idx)}</div>
                                                    ))
                                                : (
                                                    <div>{renderBackLine(tile.backContent as BackItem, 0)}</div>
                                                )
                                        )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Tilt>
        </div>
    );
}
