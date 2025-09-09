"use client";

import React from 'react';
import ProjectCard from './ProjectCard';

interface PostCardProps {
    post: {
        title: string;
        date?: string;
        excerpt?: string;
        slug: string;
        tags?: string[];
    };
}

// Thin wrapper that reuses ProjectCard for posts by mapping the post shape to Project
export const PostCard = React.memo(function PostCard({ post }: PostCardProps) {
    const excerptHtml = post.excerpt || '';
    let imageUrl: string | undefined = undefined;
    let excerptText = '';

    // Try parsing the excerpt as HTML in the browser to reliably extract <img> and text.
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(excerptHtml, 'text/html');
        const img = doc.querySelector('img');
        if (img) imageUrl = img.getAttribute('src') || undefined;
        excerptText = (doc.body.textContent || '').trim();
    } catch {
        // Fallback to simple regex-based extraction if DOMParser isn't available or fails
        const imgMatch = excerptHtml.match(/src=["']([^"']+)["']/i);
        imageUrl = imgMatch ? imgMatch[1] : undefined;
        excerptText = excerptHtml.replace(/<img[^>]*>/gi, '').replace(/<[^>]+>/g, '').trim();
    }

    return (
        // map post -> project shape expected by ProjectCard
        <ProjectCard
            project={{
                title: post.title,
                desc: excerptText,
                tags: post.tags || [],
                link: `/posts/${post.slug}`,
                image: imageUrl,
            }}
        />
    );
});

export default PostCard;
