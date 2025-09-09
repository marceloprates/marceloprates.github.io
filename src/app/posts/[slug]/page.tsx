import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import type { Pluggable, PluggableList } from 'unified';

import { getAllPosts, getPostBySlug } from '@/lib/content';

export function generateStaticParams() {
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
                    {(() => {
                        const remarkPlugins: PluggableList = [
                            remarkMath as unknown as Pluggable,
                            remarkGfm as unknown as Pluggable,
                        ];
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
