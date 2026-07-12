import { Tile } from '@/types';
import { siteConfig } from '@/config/site';

/**
 * Optional 'Speaking' tile: shown only when a Semantic Scholar URL is
 * configured. Renders as an external link (opens in new tab via
 * TileButton's external-href branch — see TileButton.openHref).
 *
 * Builds the array at module load so the tile disappears cleanly when
 * the config drops the URL.
 */
const speakingTile: Tile | null = siteConfig.social.semanticScholar
    ? {
          label: 'Speaking',
          href: siteConfig.social.semanticScholar,
          variant: 'sm',
          gradientClass: 'speaking',
          image: '/globe.svg',
      }
    : null;

export const tiles: Tile[] = [
    {
        label: 'Projects',
        href: '#projects',
        variant: 'lg',
        gradientClass: 'projects',
        image: '/globe.svg',
    },
    {
        label: 'About',
        href: '#about',
        variant: 'sm',
        gradientClass: 'about',
        image: '/window.svg',
    },
    {
        label: 'Contact',
        href: '#contact',
        variant: 'sm',
        gradientClass: 'contact',
        image: '/file.svg',
        clickBehavior: 'flip',
        backContent: [
            {
                html: `
                <a href="mailto:marceloorp@gmail.com"
                   class="no-underline transition-colors duration-150 hover:text-amber-200 focus-visible:text-amber-200 hover:opacity-90">
                  <span class="font-nerd mr-1">󰊫 </span>marceloorp
                </a>`
            },
            {
                html: `
                <a href="https://www.linkedin.com/in/marceloprates" target="_blank" rel="noopener noreferrer"
                   class="no-underline transition-colors duration-150 hover:text-amber-200 focus-visible:text-amber-200 hover:opacity-90">
                  <span class="font-nerd mr-1"> </span>marceloprates
                </a>`
            },
            {
                html: `
                <a href="https://github.com/marceloprates" target="_blank" rel="noopener noreferrer"
                   class="no-underline transition-colors duration-150 hover:text-amber-200 focus-visible:text-amber-200 hover:opacity-90">
                  <span class="font-nerd mr-1"> </span>marceloprates
                </a>`
            },
        ],
    },
    {
        label: 'Resume',
        href: '#resume',
        variant: 'md',
        gradientClass: 'resume',
        image: '/next.svg',
    },
    {
        label: 'Blog',
        href: '/posts',
        variant: 'md',
        gradientClass: 'blog',
        image: '/vercel.svg',
    },
    ...(speakingTile ? [speakingTile] : []),
    {
        label: 'Open Source',
        href: '#open-source',
        variant: 'lg',
        gradientClass: 'oss',
        image: '/file.svg',
        backContent: [
            { html: '<span>Check out my OS projects!</span>' },
            {
                html: `
                <a href="https://github.com/marceloprates/prettymaps" target="_blank" rel="noopener noreferrer"
                   class="no-underline transition-colors duration-150 hover:text-amber-200 focus-visible:text-amber-200 hover:opacity-90">
                  &gt; prettymaps
                </a>`
            },
        ],
    },
    {
        label: 'Papers',
        href: '#papers',
        variant: 'sm',
        gradientClass: 'papers',
        image: '/window.svg',
    },
    {
        label: 'Misc',
        href: '/misc',
        variant: 'md',
        gradientClass: 'misc',
        image: '/globe.svg',
    },
];

export const spanClasses: Record<string, string> = {
    lg: 'col-span-2 row-span-2',
    md: 'col-span-2 row-span-1',
    sm: 'col-span-1 row-span-1',
};
