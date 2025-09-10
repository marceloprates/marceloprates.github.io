#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

// Script: fetch-scholar.js
// - Visits Google Scholar profile page and extracts publication rows
// - For entries that are arXiv, opens the cluster "see all versions" page in a headless browser
//   and looks for publisher/DOI links that are not arXiv
// - Writes a JSON file to data/publications.scholar.json with extracted fields

const PROFILE_URL = (userId) => `https://scholar.google.com/citations?user=${userId}&hl=en&pagesize=100`;

async function fetchProfile(userId) {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    const url = PROFILE_URL(userId);
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Evaluate rows client-side for more reliable HTML compared to fetch
    const rows = await page.$$eval('tr.gsc_a_tr', (trs) => {
        return trs.map((tr) => tr.innerHTML);
    });

    const publications = [];
    for (const rowHtml of rows) {
        // Extract basic fields using DOM parsing in the browser is better, but we already have rowHtml
        // We'll open a temporary page to parse the row with the browser DOM for robust extraction
        const rpage = await browser.newPage();
        await rpage.setContent(`<table><tr>${rowHtml}</tr></table>`, { waitUntil: 'domcontentloaded' });
        const title = await rpage.$eval('.gsc_a_at', (a) => a.textContent.trim()).catch(() => '');
        const titleHref = await rpage.$eval('.gsc_a_at', (a) => a.getAttribute('href')).catch(() => '');
        const venue = await rpage.$$eval('.gs_gray', (els) => els.map((e) => e.textContent.trim())).catch(() => []);
        const venueText = venue.length >= 2 ? venue[1] : (venue[0] || '');
        const year = await rpage.$eval('.gsc_a_y .gsc_a_y', (s) => s.textContent.trim()).catch(() => '');
        const cited = await rpage.$eval('.gsc_a_c a, .gsc_a_c span', (s) => s.textContent.trim()).catch(() => '');

        // external popup link (may be available as an element with class gsc_a_ext)
        const extHref = await rpage.$eval('.gsc_a_ext', (e) => e.getAttribute('href')).catch(() => '');

        // cluster link may be in the title href or elsewhere; try to find a cluster id
        const clusterMatch = (titleHref || '').match(/cluster=([0-9A-Za-z_-]+)/);

        let preferredUrl = '';
        let pdfUrl = '';

        // If cluster exists, open cluster page and attempt to find publisher links
        if (clusterMatch) {
            const clusterId = clusterMatch[1];
            const clusterUrl = `https://scholar.google.com/scholar?oi=bibs&hl=en&cluster=${clusterId}`;
            const cpage = await browser.newPage();
            await cpage.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            try {
                await cpage.goto(clusterUrl, { waitUntil: 'domcontentloaded' });
                // collect anchors
                const anchors = await cpage.$$eval('a', (as) => as.map((a) => ({ href: a.href, text: a.textContent }))).catch(() => []);
                // preferred hosts
                const preferredHosts = ['doi.org', 'link.springer', 'springerlink', 'ieeexplore.ieee.org', 'dl.acm.org', 'onlinelibrary.wiley.com', 'sciencedirect.com', 'nature.com', 'jmlr.org', 'tandfonline.com', 'cambridge.org'];
                // find preferred
                let picked = anchors.find(a => preferredHosts.some(h => a.href.includes(h)));
                if (!picked) picked = anchors.find(a => !/arxiv.org/i.test(a.href) && !a.href.includes('scholar.google.com'));
                if (picked) {
                    preferredUrl = picked.href;
                    if (/\.pdf(\?|$)/i.test(preferredUrl)) pdfUrl = preferredUrl;
                }
            } catch {
                // ignore
            } finally {
                await cpage.close();
            }
        }

        // fallback prefer extHref, then titleHref
        if (!preferredUrl) preferredUrl = extHref ? (extHref.startsWith('http') ? extHref : `https://scholar.google.com${extHref}`) : (titleHref ? (titleHref.startsWith('http') ? titleHref : `https://scholar.google.com${titleHref}`) : '');

        publications.push({ title, venue: venueText, year: parseInt(year) || undefined, url: preferredUrl || '', pdfUrl: pdfUrl || undefined, citations: parseInt(cited) || undefined });
        await rpage.close();
    }

    await browser.close();
    return publications;
}

async function main() {
    const userId = process.argv[2] || 'pzoM9S8AAAAJ';
    const outDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, 'publications.scholar.json');

    const pubs = await fetchProfile(userId);
    fs.writeFileSync(outPath, JSON.stringify({ fetchedAt: new Date().toISOString(), userId, publications: pubs }, null, 2));
    console.log('Wrote', outPath);
}

main().catch((err) => { console.error(err); process.exit(1); });
