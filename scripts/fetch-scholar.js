#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
// Note: we intentionally avoid adding heavy scraping libraries to keep this script
// dependency-light. We do a gentle HTML parse of Google Scholar results to
// extract the "Cited by N" count. If you prefer a more robust parser, add
// cheerio and switch to it.

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

    console.log('Enriching publications with Google Scholar citation counts (this may be slow)...');
    // Enrich each publication with Google Scholar citation counts when possible.
    for (let i = 0; i < pubs.length; i++) {
        const p = pubs[i];
        try {
            // Use title + first author name to increase match likelihood
            const firstAuthor = (p.authors && p.authors.length) ? p.authors[0] : '';
            const gsCitations = await fetchGoogleScholarCitations(p.title, firstAuthor);
            p.googleScholarCitations = gsCitations;
            // Choose the higher / preferred citation count (Google Scholar tends to be higher)
            p.citationsUpdated = (typeof gsCitations === 'number' && gsCitations > (p.citations || 0)) ? gsCitations : (p.citations || 0);
            p.citationCountSources = {
                semanticScholar: p.citations || 0,
                googleScholar: (typeof gsCitations === 'number') ? gsCitations : null
            };
        } catch (err) {
            console.warn('Failed to fetch Google Scholar for', p.title, err && err.message);
            p.googleScholarCitations = null;
            p.citationsUpdated = p.citations || 0;
            p.citationCountSources = {
                semanticScholar: p.citations || 0,
                googleScholar: null
            };
        }

        // Delay between requests to avoid being blocked (polite scraping)
        await delay(1500);
    }

    fs.writeFileSync(outPath, JSON.stringify({
        fetchedAt: new Date().toISOString(),
        source: 'semantic-scholar+google-scholar',
        authorId: AUTHOR_ID,
        publications: pubs
    }, null, 2));
    console.log('Wrote', outPath);
}

function delay(ms) {
    return new Promise((res) => setTimeout(res, ms));
}

async function fetchGoogleScholarCitations(title, firstAuthor = '') {
    // Query Google Scholar with title and first author for disambiguation.
    const query = `${title} ${firstAuthor}`.trim();
    const url = `https://scholar.google.com/scholar?hl=en&q=${encodeURIComponent(query)}`;

    // Use a browser-like user agent. Google blocks non-browser agents aggressively.
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    };

    try {
        const resp = await fetch(url, { headers });
        if (!resp.ok) {
            // If blocked (e.g. 403) or other error, return null and let caller fallback
            console.warn(`Google Scholar request failed: ${resp.status} ${resp.statusText}`);
            return null;
        }

        const html = await resp.text();

        // Look for the first "Cited by N" occurrence in the result page.
        // Typical snippet: <a href="/scholar?cites=12345">Cited by 123</a>
        const citedByMatch = html.match(/Cited by\s*(\d+)/i);
        if (citedByMatch && citedByMatch[1]) {
            const n = parseInt(citedByMatch[1], 10);
            if (!Number.isNaN(n)) return n;
        }

        // Fallback: try to find link with /scholar?cites= and digits followed by >Cited by N<
        const linkMatch = html.match(/<a[^>]+href="[^"]*\/scholar\?cites=[^\"]+"[^>]*>\s*Cited by\s*(\d+)\s*<\/a>/i);
        if (linkMatch && linkMatch[1]) {
            const n = parseInt(linkMatch[1], 10);
            if (!Number.isNaN(n)) return n;
        }

        return null;
    } catch (err) {
        console.warn('Error querying Google Scholar for', title, err && err.message);
        return null;
    }
}

main().catch((err) => { console.error(err); process.exit(1); });
