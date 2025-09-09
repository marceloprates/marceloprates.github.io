export interface Project {
    title: string;
    desc: string;
    tags: string[];
    link: string;
    image?: string;
}

import type { ReactNode } from 'react';

export interface BackLine {
    /** Text to display for the line */
    text: string;
    /** Optional href to open when clicked */
    href?: string;
    /** Optional semantic type for custom rendering/behavior */
    type?: 'email' | 'linkedin' | 'github' | 'link';
}

/**
 * A single item that can appear on the back of a Tile.
 * Supports plain strings, structured lines, raw HTML, or full React nodes.
 */
export type BackItem = string | BackLine | { html: string } | ReactNode;

export interface Tile {
    label: string;
    href: string;
    variant: 'lg' | 'md' | 'sm';
    gradient?: string; // deprecated: use gradientClass for CSS-based gradients
    gradientClass?: string;
    image?: string; // optional illustration shown on the right with a diagonal slash
    /**
     * Controls what happens when the tile is clicked.
     * - 'flip': show the back side with extra content
     * - 'scroll': smoothly scroll to the element referenced by `href` (default)
     */
    clickBehavior?: 'flip' | 'scroll';
    /**
     * Optional content to show on the back of the tile when flipped.
    * Can be a single string (supports line breaks) or an array of lines.
    * Also supports structured objects for explicit control of labels and links,
    * raw HTML via { html: string }, or full React nodes for maximum flexibility.
     */
    backContent?: BackItem | BackItem[];
}

export type SpanClasses = Record<'lg' | 'md' | 'sm', string>;

export interface Publication {
    title: string;
    venue: string;
    year: number;
    url: string;
    pdfUrl?: string;
}
