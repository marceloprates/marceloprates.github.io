// Manually curated list of GitHub repo identifiers for any
// component that needs the historical `selectedProjects` shape.
// Since nav-redesign Phase C the home page no longer renders a
// Selected Projects section; Phase D's /work grid covers the
// curated surface via getWorkProjects(). The Starship project is
// not on GitHub — its record is appended by getWorkProjects()
// directly. This file is kept only because legacy imports still
// reference the symbol.
export const selectedProjects: string[] = [
    'marceloprates/prettymaps',
    'marceloprates/easyshader',
    'marceloprates/Cosmos',
    'marceloprates/TSP-Animation',
];
