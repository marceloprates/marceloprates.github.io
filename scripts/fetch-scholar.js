#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

// Script: fetch-scholar.js
// - Fetches publications from Semantic Scholar API
// - Writes a JSON file to data/publications.scholar.json with extracted fields

const API_URL = 'https://api.semanticscholar.org/graph/v1';
const AUTHOR_ID = '144677268'; // Marcelo O. R. Prates

// Papers to exclude (known incorrect attributions)
const EXCLUDED_PAPERS = [
    '823dbab690b96cd624facb7b6f9c5db05096af80' // Pure-Past Linear Temporal and Dynamic Logic paper
];

async function fetchProfile() {
    console.log('Fetching publications from Semantic Scholar...');

    const response = await fetch(`${API_URL}/author/${AUTHOR_ID}?fields=name,papers.title,papers.year,papers.venue,papers.citationCount,papers.openAccessPdf,papers.url,papers.isOpenAccess,papers.authors`, {
        headers: {
            'Accept': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    console.log(`Found ${data.papers.length} publications...`);

    // Get your name from the API response
    const authorName = data.name;
    console.log(`Author name: ${authorName}`);

    // Filter papers to ensure you're an author, exclude known incorrect papers,
    // filter out papers without proper venues or from arXiv, and papers with <10 citations
    const filteredPapers = data.papers.filter(paper => {
        // Extract paper ID from URL
        const paperId = paper.url.split('/').pop();

        // Exclude known incorrect papers
        if (EXCLUDED_PAPERS.includes(paperId)) {
            return false;
        }

        // Exclude papers without venue or from arXiv
        if (!paper.venue || paper.venue.trim() === '' || paper.venue.toLowerCase() === 'arxiv.org') {
            return false;
        }

        // Exclude papers with less than 10 citations
        if (!paper.citationCount || paper.citationCount < 10) {
            return false;
        }

        // Check for exact name match
        const hasExactMatch = paper.authors.some(author =>
            author.name === authorName ||
            author.name === "Marcelo O. R. Prates" ||
            author.name === "Marcelo Prates"
        );

        return hasExactMatch;
    });

    console.log(`Filtered to ${filteredPapers.length} papers where you are an author...`);

    const publications = filteredPapers.map(paper => ({
        title: paper.title,
        venue: paper.venue,
        year: paper.year,
        url: paper.url || '',
        pdfUrl: paper.openAccessPdf?.url,
        citations: paper.citationCount,
        isOpenAccess: paper.isOpenAccess,
        authors: paper.authors.map(a => a.name) // Include author names for verification
    }));

    // Sort by year (newest first)
    publications.sort((a, b) => (b.year || 0) - (a.year || 0));

    return publications;
}

async function main() {
    const outDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, 'publications.scholar.json');

    const pubs = await fetchProfile();
    fs.writeFileSync(outPath, JSON.stringify({
        fetchedAt: new Date().toISOString(),
        source: 'semantic-scholar',
        authorId: AUTHOR_ID,
        publications: pubs
    }, null, 2));
    console.log('Wrote', outPath);
}

main().catch((err) => { console.error(err); process.exit(1); });
