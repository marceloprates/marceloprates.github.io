import { Project } from '@/types';

export const projects: Project[] = [

    {
        title: 'prettymaps',
        desc: 'Generate beautiful maps from OpenStreetMap data with Python and matplotlib.',
        tags: ['Python', 'Maps', 'OpenStreetMap'],
        link: 'https://github.com/marceloprates/prettymaps',
        image: 'https://raw.githubusercontent.com/marceloprates/prettymaps/main/pictures/heerhugowaard.png',
    },
    {
        title: 'easyshader',
        desc: 'A Python DSL for 3D art using signed distance functions and raymarching, with mesh export and AR experiments.',
        tags: ['Python', 'SDF', 'Raymarching'],
        link: '/projects/easyshader',
        image: '/images/projects/easyshader/print-2.png',
    },
    {
        title: 'streamlines',
        desc: 'Generative art from vector fields: ODE-integrated streamlines with stylization (median blur + SLIC) and palette colors; includes Blender/plotter and TSP animations.',
        tags: ['Python', 'Vector Fields', 'Streamlines'],
        link: '/projects/streamlines',
        image: '/images/projects/streamlines/streamlines-cover.png',
    },
    {
        title: 'cosmos',
        desc: 'An edited, modernized LaTeX edition of Humboldt’s “Cosmos” (Vol. 1) from OCR, with figures and improved accessibility; PDF available.',
        tags: ['LaTeX', 'Editing', 'OCR'],
        link: 'https://marceloprates.github.io/portfolio/2024-3-13-cosmos/',
    },

];
