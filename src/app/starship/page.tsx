import 'server-only';
import { getHighlighter } from 'shiki';
import React from 'react';

// Simple YAML display page that fetches content from a GitHub Gist
// Route: /starship
async function fetchGist(): Promise<string> {
    const url = 'https://gist.githubusercontent.com/marceloprates/08d994f3aa6d0e8e6ce4dbd44ccde6b2/raw';
    const res = await fetch(url, {
        next: { revalidate: 60 * 60 * 12 },
        cache: 'force-cache',
    });
    if (!res.ok) throw new Error(`Failed to fetch Starship gist: ${res.status}`);
    return res.text();
}

async function highlightYaml(yaml: string) {
    const highlighter = await getHighlighter({ theme: 'nord' });
    // Use shiki's built-in html renderer
    let html = highlighter.codeToHtml(yaml, { lang: 'yaml' });
    // Ensure the generated <pre> fills the container and includes padding so
    // there is no white margin between the outer rounded box and the code background.
    html = html.replace(/<pre([^>]*)>/, '<pre$1 style="padding:1rem;margin:0;overflow:auto;">');
    return html;
}

export default async function StarshipPage() {
    const content = await fetchGist();
    const highlighted = await highlightYaml(content);

    return (
        <main className="mx-auto max-w-3xl px-4 py-10">
            <h1 className="text-2xl font-semibold tracking-tight mb-4 bg-gradient-to-r from-pink-500 via-orange-500 to-amber-400 bg-clip-text text-transparent">
                Starship Prompt Theme (YAML)
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                Fetched from GitHub Gist and displayed as read-only YAML with syntax highlighting.
            </p>

            <div className="rounded-xl ring-1 ring-black/5 dark:ring-white/10 overflow-hidden">
                <div className="m-0 text-xs leading-relaxed overflow-x-auto">
                    <div dangerouslySetInnerHTML={{ __html: highlighted }} />
                </div>
            </div>
        </main>
    );
}
