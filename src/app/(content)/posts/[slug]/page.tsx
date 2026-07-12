import React from 'react';
import ReactMarkdown from 'react-markdown';

import { getAllPosts, getPostBySlug } from '@/lib/content';
import { MarkdownPre } from '@/components/MarkdownPre';
import { defaultRemarkPlugins, defaultRehypePlugins } from '@/lib/markdown-config';

export async function generateStaticParams() {
    const posts = getAllPosts();
    return posts.map((p) => ({ slug: p.slug }));
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
