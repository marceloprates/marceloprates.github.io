import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import type { Pluggable, PluggableList } from 'unified';

import { getAllProjects, getProjectBySlug } from '@/lib/content';

// Frontmatter shape for project markdown files (extend as needed)
interface ProjectFrontmatter {
    title?: string;
    date?: string;
    tags?: string[];
    excerpt?: string;
    cover?: string; // canonical cover field
    image?: string; // fallback legacy field name
    [key: string]: unknown; // allow additional arbitrary keys without using 'any'
}

export async function generateStaticParams() {
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

    const meta = (project.meta || {}) as ProjectFrontmatter;
    const content = project.content || '';

    return (
        <main className="px-4 py-16 mx-auto max-w-4xl">
            <article className="prose dark:prose-invert">
                <header>
                    <h1 className="text-3xl font-extrabold mb-2">{meta.title || slug}</h1>
                    {meta.date && <p className="text-sm text-gray-600">{meta.date}</p>}
                    {/* Optional cover image from frontmatter (cover or image) */}
                    {(() => {
                        const cover = meta.cover || meta.image;
                        if (!cover || typeof cover !== 'string') return null;
                        // Normalize: if it's a bare filename (no leading / or protocol), assume /images/projects/{slug}/<file>
                        const normalized = /^(https?:)?\//.test(cover)
                            ? cover
                            : `/images/projects/${slug}/${cover}`;
                        return (
                            <div className="mt-6 not-prose rounded-xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
                                {/* Using plain <img> intentionally for static export (no optimization pipeline) */}
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={normalized}
                                    alt={`${meta.title || slug} cover`}
                                    className="w-full h-auto block"
                                    loading="lazy"
                                />
                            </div>
                        );
                    })()}
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
