#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.resolve(__dirname, '../content');

function walkDir(dir, filelist = []) {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
        const filepath = path.join(dir, file);
        const stat = fs.statSync(filepath);
        if (stat.isDirectory()) {
            walkDir(filepath, filelist);
        } else if (stat.isFile() && /\.mdx?$/.test(file)) {
            filelist.push(filepath);
        }
    });
    return filelist;
}

function findBadImageRefs(content) {
    // matches ![](...), <img src="...">, or plain markdown link to an image
    const regex = /!\[[^\]]*\]\(([^)]+)\)|<img[^>]+src=["']([^"']+)["'][^>]*>/g;
    const bad = [];
    let m;
    while ((m = regex.exec(content)) !== null) {
        const ref = m[1] || m[2];
        if (!ref) continue;
        // ignore absolute URLs and data URIs
        if (/^https?:\/\//.test(ref) || /^data:/i.test(ref)) continue;
        // allow site-root absolute paths starting with /images/
        if (!ref.startsWith('/images/')) {
            bad.push(ref);
        }
    }
    return bad;
}

function main() {
    if (!fs.existsSync(CONTENT_DIR)) {
        console.error('content directory not found:', CONTENT_DIR);
        process.exit(2);
    }

    const files = walkDir(CONTENT_DIR);
    let problems = 0;

    files.forEach((file) => {
        const content = fs.readFileSync(file, 'utf8');
        const badRefs = findBadImageRefs(content);
        if (badRefs.length) {
            problems += badRefs.length;
            console.log(`\n[${path.relative(process.cwd(), file)}] found ${badRefs.length} non-/images/ image refs:`);
            badRefs.forEach((r) => console.log('  ', r));
        }
    });

    if (problems) {
        console.error(`\nFound ${problems} image references that are not site-root (/images/...) or absolute URLs.`);
        console.error('Place images under public/images/ and reference them as /images/... in markdown.');
        process.exit(1);
    }

    console.log('All markdown image references look good.');
}

if (require.main === module) main();
