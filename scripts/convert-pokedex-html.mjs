#!/usr/bin/env node
import { readFileSync } from 'fs';
import { JSDOM } from 'jsdom';

const htmlPath = process.argv[2];
if (!htmlPath) {
    console.error('Usage: node convert-pokedex-html.mjs <html-file-path>');
    process.exit(1);
}

const html = readFileSync(htmlPath, 'utf-8');
const dom = new JSDOM(html);
const doc = dom.window.document;

const rows = doc.querySelectorAll('tbody tr');
const pokemons = [];

rows.forEach((row) => {
    const cells = row.querySelectorAll('td');
    if (cells.length >= 5) {
        const name = cells[0].textContent.trim();
        const spellEn = cells[1].textContent.trim();
        const spellPt = cells[2].textContent.trim();
        const spellEs = cells[3].textContent.trim();
        const imgEl = cells[4].querySelector('img');
        const sprite = imgEl ? imgEl.getAttribute('src') : '';

        pokemons.push({
            name,
            spellEn: spellEn === '-' ? '' : spellEn,
            spellPt: spellPt === '-' ? '' : spellPt,
            spellEs: spellEs === '-' ? '' : spellEs,
            sprite
        });
    }
});

console.log(JSON.stringify(pokemons, null, 2));
