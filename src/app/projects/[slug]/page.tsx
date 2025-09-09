import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import type { Pluggable, PluggableList } from 'unified';

import { getAllProjects, getProjectBySlug } from '@/lib/content';

export function generateStaticParams() {
    const projects = getAllProjects();
    return projects.map((p) => ({ slug: p.slug }));
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const project = getProjectBySlug(slug);

    if (!project) {
        return (
            <main className="px-4 py-16 mx-auto max-w-4xl">
                <h1 className="text-2xl font-bold">Project not found</h1>
                <p className="mt-4 text-sm text-gray-600">No project matches the slug: {slug}</p>
            </main>
        );
    }

    const meta = project.meta || {};
    const content = project.content || '';

    return (
        <main className="px-4 py-16 mx-auto max-w-4xl">
            <article className="prose dark:prose-invert">
                <header>
                    <h1 className="text-3xl font-extrabold mb-2">{meta.title || slug}</h1>
                    {meta.date && <p className="text-sm text-gray-600">{meta.date}</p>}
                </header>

                <section className="mt-6">
                    {(() => {
                        const remarkPlugins: PluggableList = [
                            remarkMath as unknown as Pluggable,
                            remarkGfm as unknown as Pluggable,
                        ];
                        // rehypeRaw parses raw HTML in markdown (needed for <img> tags in content)
                        // Place rehypeRaw before other rehype plugins
                        const rehypePlugins: PluggableList = [
                            rehypeRaw as unknown as Pluggable,
                            rehypeKatex as unknown as Pluggable,
                        ];
                        return (
                            <ReactMarkdown remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins}>
                                {content}
                            </ReactMarkdown>
                        );
                    })()}
                </section>
            </article>
        </main>
    );
}
