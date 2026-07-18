import React from 'react';
import ReactMarkdown from 'react-markdown';

import { getAllPostSlugs, getPostBySlug } from '@/lib/content';
import { MarkdownPre } from '@/components/MarkdownPre';
import { defaultRemarkPlugins, defaultRehypePlugins } from '@/lib/markdown-config';

export async function generateStaticParams() {
    // Enumerate EVERY slug on disk (incl. drafts) so Next's static
    // export can pre-render a "Post not found" page for draft
    // slugs. The draft filter lives in getPostBySlug() at render
    // time, not here.
    const slugs = getAllPostSlugs();
    // Next's output:export check requires every dynamic route to
    // produce at least one prerendered route — an empty list fails
    // the build with 'missing "generateStaticParams()"'. Zero posts
    // is a legitimate state (the only post is a gitignored local
    // draft), so emit a sentinel slug that renders the same "Post
    // not found" page as any unknown slug.
    if (slugs.length === 0) return [{ slug: '_not-found' }];
    return slugs.map((slug) => ({ slug }));
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = getPostBySlug(slug);

    if (!post) {
        return (
            <main className="px-4 py-16 mx-auto max-w-4xl">
                <h1 className="text-2xl font-bold">Post not found</h1>
                <p className="mt-4 text-sm text-gray-600">No post matches the slug: {slug}</p>
            </main>
        );
    }

    const meta = post.meta || {};
    const content = post.content || '';

    return (
        <main className="px-4 py-16 mx-auto max-w-4xl">
            <article className="prose dark:prose-invert">
                <header>
                    <h1 className="text-3xl font-extrabold mb-2">{meta.title || slug}</h1>
                    {meta.date && <p className="text-sm text-gray-600">{meta.date}</p>}
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
