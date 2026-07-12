import React from 'react';
import ReactMarkdown from 'react-markdown';

import { getAllProjects, getProjectBySlug } from '@/lib/content';
import { MarkdownPre } from '@/components/MarkdownPre';
import { defaultRemarkPlugins, defaultRehypePlugins } from '@/lib/markdown-config';
import { PrivateBadge } from '@/components/PrivateBadge';

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

    // meta is now typed as ProjectFrontmatter via getProjectBySlug's
    // return type. Runtime conformance enforced by validate:frontmatter
    // (precommit gate).
    const meta = project.meta;
    const content = project.content;

    return (
        <main className="px-4 py-16 mx-auto max-w-4xl">
            <article className="prose dark:prose-invert">
                <header>
                    <div className="flex items-start gap-3 mb-2 flex-wrap">
                        <h1 className="text-3xl font-extrabold">{meta.title || slug}</h1>
                        {meta.private && <PrivateBadge className="mt-1.5" />}
                    </div>
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
                    <ReactMarkdown
                        remarkPlugins={defaultRemarkPlugins}
                        rehypePlugins={defaultRehypePlugins}
                        components={{ pre: MarkdownPre }}
                    >
                        {content}
                    </ReactMarkdown>
                </section>
            </article>
        </main>
    );
}
